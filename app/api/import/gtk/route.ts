import { NextRequest } from "next/server";
import { db, sekolah, users, gtk } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { eq, ilike } from "drizzle-orm";
import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "super_admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return new Response(JSON.stringify({ error: "File tidak ditemukan" }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendLog = (step: string, status: string, message: string, data?: string) => {
        const log = JSON.stringify({ step, status, message, data }) + "\n";
        controller.enqueue(encoder.encode(log));
      };

      try {
        // Get school name from filename
        const fileName = file.name.replace(/\.(xlsx|xls)$/i, "");
        sendLog("Membaca nama file", "processing", `Nama file: ${file.name}`, fileName);

        // Find school by name
        sendLog("Mencari sekolah", "processing", `Mencari sekolah dengan nama: ${fileName}`);

        const foundSekolah = await db.query.sekolah.findFirst({
          where: ilike(sekolah.nama, `%${fileName}%`),
        });

        if (!foundSekolah) {
          sendLog("Mencari sekolah", "error", `Sekolah "${fileName}" tidak ditemukan di database`);
          sendLog("DONE", "error", JSON.stringify({ imported: 0, skipped: 0, total: 0, sekolah: null }));
          controller.close();
          return;
        }

        sendLog("Mencari sekolah", "success", `Sekolah ditemukan: ${foundSekolah.nama}`);

        // Read Excel file
        sendLog("Membaca file Excel", "processing", "Memproses file Excel...");

        const bytes = await file.arrayBuffer();
        const workbook = XLSX.read(bytes, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          sendLog("Membaca file Excel", "error", "File Excel kosong");
          sendLog("DONE", "error", JSON.stringify({ imported: 0, skipped: 0, total: 0, sekolah: foundSekolah.nama }));
          controller.close();
          return;
        }

        sendLog("Membaca file Excel", "success", `Ditemukan ${jsonData.length} baris data`);

        let imported = 0;
        let skipped = 0;
        const defaultPassword = await bcrypt.hash("gtk123", 12);

        for (let i = 0; i < jsonData.length; i++) {
          const row: any = jsonData[i];
          const rowNum = i + 2;

          const namaLengkap = (row["Nama Lengkap"] || row["nama_lengkap"] || row["Nama"] || "").toString().trim();
          const nuptk = (row["NUPTK"] || row["nuptk"] || "").toString().trim() || null;
          const nip = (row["NIP"] || row["nip"] || "").toString().trim() || null;
          const kelaminRaw = (row["L/P"] || row["Kelamin"] || row["kelamin"] || row["JK"] || "").toString().trim().toUpperCase();
          const tanggalLahirRaw = row["Tanggal Lahir"] || row["tanggal_lahir"] || row["TGL_LAHIR"] || "";
          const jenisPtkRaw = (row["Jenis PTK"] || row["jenis_ptk"] || row["Jenis"] || "").toString().trim().toLowerCase();
          const jabatan = (row["Jabatan PTK"] || row["Jabatan"] || row["jabatan"] || "").toString().trim() || null;

          if (!namaLengkap) {
            sendLog(`Baris ${rowNum}`, "skipped", "Nama kosong, dilewati");
            skipped++;
            continue;
          }

          // Check if GTK already exists by name
          const existingGtk = await db.query.gtk.findFirst({
            where: eq(gtk.namaLengkap, namaLengkap),
          });

          if (existingGtk) {
            sendLog(`Baris ${rowNum}`, "skipped", `GTK "${namaLengkap}" sudah ada di database`);
            skipped++;
            continue;
          }

          const kelamin = kelaminRaw === "L" || kelaminRaw === "LAKI-LAKI" ? "L" : "P";

          // Parse tanggal lahir
          let tanggalLahir: string;
          if (typeof tanggalLahirRaw === "number") {
            const date = XLSX.SSF.parse_date_code(tanggalLahirRaw);
            tanggalLahir = `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
          } else if (tanggalLahirRaw) {
            const dateStr = tanggalLahirRaw.toString();
            if (dateStr.includes("-")) {
              tanggalLahir = dateStr;
            } else if (dateStr.includes("/")) {
              const parts = dateStr.split("/");
              if (parts[2]?.length === 4) {
                tanggalLahir = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
              } else {
                tanggalLahir = `19${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
              }
            } else {
              tanggalLahir = "1990-01-01";
            }
          } else {
            tanggalLahir = "1990-01-01";
          }

          // Parse jenis GTK
          let jenis: "guru" | "tendik" | "kepala_sekolah" = "guru";
          if (jenisPtkRaw.includes("tendik") || jenisPtkRaw.includes("tenaga kependidikan")) {
            jenis = "tendik";
          } else if (jenisPtkRaw.includes("kepala")) {
            jenis = "kepala_sekolah";
          }

          // Generate unique email
          const emailBase = namaLengkap
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "")
            .substring(0, 20);
          const email = `${emailBase}.${Date.now()}@gtk.sipodi.id`;

          try {
            const [newUser] = await db
              .insert(users)
              .values({
                email,
                password: defaultPassword,
                role: "gtk",
              })
              .returning();

            await db.insert(gtk).values({
              userId: newUser.id,
              namaLengkap,
              nuptk: nuptk || null,
              nip: nip || null,
              kelamin,
              tanggalLahir,
              jenis,
              jabatan,
              sekolahId: foundSekolah.id,
            });

            sendLog(`Baris ${rowNum}`, "success", `GTK "${namaLengkap}" berhasil diimport`, `Jenis: ${jenis}, Jabatan: ${jabatan || "-"}`);
            imported++;
          } catch (error: any) {
            sendLog(`Baris ${rowNum}`, "error", `Gagal import "${namaLengkap}": ${error.message}`);
          }
        }

        sendLog("Selesai", "success", `Import selesai. Berhasil: ${imported}, Dilewati: ${skipped}`);
        sendLog("DONE", "success", JSON.stringify({ imported, skipped, total: jsonData.length, sekolah: foundSekolah.nama }));
        controller.close();
      } catch (error: any) {
        sendLog("Error", "error", `Terjadi kesalahan: ${error.message}`);
        sendLog("DONE", "error", JSON.stringify({ imported: 0, skipped: 0, total: 0, sekolah: null }));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
