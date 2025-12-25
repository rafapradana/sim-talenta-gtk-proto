import { NextRequest } from "next/server";
import { db, sekolah } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import * as XLSX from "xlsx";

function detectJenjang(nama: string): "SMA" | "SMK" | "SLB" {
  const namaUpper = nama.toUpperCase();
  if (namaUpper.includes("SMK") || namaUpper.includes("SMKN")) {
    return "SMK";
  }
  if (namaUpper.includes("SLB") || namaUpper.includes("SDLB") || namaUpper.includes("SMPLB") || namaUpper.includes("SMALB")) {
    return "SLB";
  }
  return "SMA";
}

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
  const kota = formData.get("kota") as string;

  if (!file) {
    return new Response(JSON.stringify({ error: "File tidak ditemukan" }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (!kota || !["kota_malang", "kota_batu"].includes(kota)) {
    return new Response(JSON.stringify({ error: "Pilih kota yang valid" }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Create streaming response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendLog = (step: string, status: string, message: string, data?: string) => {
        const log = JSON.stringify({ step, status, message, data }) + "\n";
        controller.enqueue(encoder.encode(log));
      };

      try {
        sendLog("Memulai import", "processing", `File: ${file.name}, Kota: ${kota === "kota_malang" ? "Kota Malang" : "Kota Batu"}`);

        sendLog("Membaca file Excel", "processing", "Memproses file Excel...");

        const bytes = await file.arrayBuffer();
        const workbook = XLSX.read(bytes, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          sendLog("Membaca file Excel", "error", "File Excel kosong");
          sendLog("DONE", "error", JSON.stringify({ imported: 0, skipped: 0, total: 0 }));
          controller.close();
          return;
        }

        sendLog("Membaca file Excel", "success", `Ditemukan ${jsonData.length} baris data`);

        let imported = 0;
        let skipped = 0;

        for (let i = 0; i < jsonData.length; i++) {
          const row: any = jsonData[i];
          const rowNum = i + 2;

          const nama = (row["Nama Satuan Pendidikan"] || row["Nama Sekolah"] || row["nama"] || "").toString().trim();
          const npsn = String(row["NPSN"] || row["npsn"] || "").trim();
          const statusRaw = (row["Status Sekolah"] || row["Status"] || row["status"] || "").toString().toLowerCase();
          const alamat = (row["Alamat"] || row["alamat"] || "").toString().trim();
          const kepalaSekolah = (row["Nama Kepala Sekolah"] || row["Kepala Sekolah"] || row["kepala_sekolah"] || "").toString().trim();

          if (!nama || !npsn) {
            sendLog(`Baris ${rowNum}`, "skipped", "Nama atau NPSN kosong, dilewati");
            skipped++;
            continue;
          }

          let status: "negeri" | "swasta" = "swasta";
          if (statusRaw.includes("negeri")) {
            status = "negeri";
          }

          const jenjang = detectJenjang(nama);

          const data = {
            nama,
            npsn,
            jenjang,
            status,
            kota: kota as "kota_malang" | "kota_batu",
            alamat: alamat || "-",
            kepalaSekolah: kepalaSekolah || null,
          };

          try {
            await db.insert(sekolah).values(data).onConflictDoNothing();
            sendLog(`Baris ${rowNum}`, "success", `"${nama}" berhasil diimport`, `Jenjang: ${jenjang}, Status: ${status === "negeri" ? "Negeri" : "Swasta"}`);
            imported++;
          } catch (error: any) {
            if (error.code === "23505") {
              sendLog(`Baris ${rowNum}`, "skipped", `"${nama}" sudah ada (NPSN: ${npsn})`);
              skipped++;
            } else {
              sendLog(`Baris ${rowNum}`, "error", `Gagal import "${nama}": ${error.message}`);
            }
          }
        }

        sendLog("Selesai", "success", `Import selesai. Berhasil: ${imported}, Dilewati: ${skipped}`);
        sendLog("DONE", "success", JSON.stringify({ imported, skipped, total: jsonData.length }));
        controller.close();
      } catch (error: any) {
        sendLog("Error", "error", `Terjadi kesalahan: ${error.message}`);
        sendLog("DONE", "error", JSON.stringify({ imported: 0, skipped: 0, total: 0 }));
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
