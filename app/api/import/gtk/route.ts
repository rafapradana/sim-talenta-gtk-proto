import { NextRequest, NextResponse } from "next/server";
import { db, sekolah, users, gtk } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { eq, ilike } from "drizzle-orm";
import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";

interface ImportLog {
  step: string;
  status: "processing" | "success" | "error" | "skipped";
  message: string;
  data?: string;
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    const logs: ImportLog[] = [];
    
    // Get school name from filename
    const fileName = file.name.replace(/\.(xlsx|xls)$/i, "");
    logs.push({
      step: "Membaca nama file",
      status: "processing",
      message: `Nama file: ${file.name}`,
      data: fileName,
    });

    // Find school by name
    logs.push({
      step: "Mencari sekolah",
      status: "processing",
      message: `Mencari sekolah dengan nama: ${fileName}`,
    });

    const foundSekolah = await db.query.sekolah.findFirst({
      where: ilike(sekolah.nama, `%${fileName}%`),
    });

    if (!foundSekolah) {
      logs.push({
        step: "Mencari sekolah",
        status: "error",
        message: `Sekolah "${fileName}" tidak ditemukan di database`,
      });
      return NextResponse.json({
        error: `Sekolah "${fileName}" tidak ditemukan. Pastikan nama file sesuai dengan nama sekolah di database.`,
        logs,
      }, { status: 400 });
    }

    logs.push({
      step: "Mencari sekolah",
      status: "success",
      message: `Sekolah ditemukan: ${foundSekolah.nama} (ID: ${foundSekolah.id})`,
    });

    // Read Excel file
    logs.push({
      step: "Membaca file Excel",
      status: "processing",
      message: "Memproses file Excel...",
    });

    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      logs.push({
        step: "Membaca file Excel",
        status: "error",
        message: "File Excel kosong",
      });
      return NextResponse.json({ error: "File Excel kosong", logs }, { status: 400 });
    }

    logs.push({
      step: "Membaca file Excel",
      status: "success",
      message: `Ditemukan ${jsonData.length} baris data`,
    });

    // Process each row
    let imported = 0;
    let skipped = 0;
    const defaultPassword = await bcrypt.hash("gtk123", 12);

    for (let i = 0; i < jsonData.length; i++) {
      const row: any = jsonData[i];
      const rowNum = i + 2; // Excel row number (1-indexed + header)

      // Extract data from Excel columns
      const namaLengkap = (row["Nama Lengkap"] || row["nama_lengkap"] || row["Nama"] || "").toString().trim();
      const nuptk = (row["NUPTK"] || row["nuptk"] || "").toString().trim() || null;
      const nip = (row["NIP"] || row["nip"] || "").toString().trim() || null;
      const kelaminRaw = (row["L/P"] || row["Kelamin"] || row["kelamin"] || row["JK"] || "").toString().trim().toUpperCase();
      const tanggalLahirRaw = row["Tanggal Lahir"] || row["tanggal_lahir"] || row["TGL_LAHIR"] || "";
      const jenisPtkRaw = (row["Jenis PTK"] || row["jenis_ptk"] || row["Jenis"] || "").toString().trim().toLowerCase();
      const jabatan = (row["Jabatan PTK"] || row["Jabatan"] || row["jabatan"] || "").toString().trim() || null;

      if (!namaLengkap) {
        logs.push({
          step: `Baris ${rowNum}`,
          status: "skipped",
          message: "Nama kosong, dilewati",
        });
        skipped++;
        continue;
      }

      // Check if GTK already exists by name
      const existingGtk = await db.query.gtk.findFirst({
        where: eq(gtk.namaLengkap, namaLengkap),
      });

      if (existingGtk) {
        logs.push({
          step: `Baris ${rowNum}`,
          status: "skipped",
          message: `GTK "${namaLengkap}" sudah ada di database`,
        });
        skipped++;
        continue;
      }

      // Parse kelamin
      const kelamin = kelaminRaw === "L" || kelaminRaw === "LAKI-LAKI" ? "L" : "P";

      // Parse tanggal lahir
      let tanggalLahir: string;
      if (typeof tanggalLahirRaw === "number") {
        // Excel date serial number
        const date = XLSX.SSF.parse_date_code(tanggalLahirRaw);
        tanggalLahir = `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
      } else if (tanggalLahirRaw) {
        // Try to parse string date
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
        // Create user
        const [newUser] = await db
          .insert(users)
          .values({
            email,
            password: defaultPassword,
            role: "gtk",
          })
          .returning();

        // Create GTK
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

        logs.push({
          step: `Baris ${rowNum}`,
          status: "success",
          message: `GTK "${namaLengkap}" berhasil diimport`,
          data: `Jenis: ${jenis}, Jabatan: ${jabatan || "-"}`,
        });
        imported++;
      } catch (error: any) {
        logs.push({
          step: `Baris ${rowNum}`,
          status: "error",
          message: `Gagal import "${namaLengkap}": ${error.message}`,
        });
      }
    }

    logs.push({
      step: "Selesai",
      status: "success",
      message: `Import selesai. Berhasil: ${imported}, Dilewati: ${skipped}`,
    });

    return NextResponse.json({
      message: "Import selesai",
      sekolah: foundSekolah.nama,
      imported,
      skipped,
      total: jsonData.length,
      logs,
    });
  } catch (error: any) {
    console.error("Import GTK error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat import: " + error.message }, { status: 500 });
  }
}
