import { NextRequest, NextResponse } from "next/server";
import { db, sekolah } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import * as XLSX from "xlsx";

interface ImportLog {
  step: string;
  status: "processing" | "success" | "error" | "skipped";
  message: string;
  data?: string;
}

function detectJenjang(nama: string): "SMA" | "SMK" | "SLB" {
  const namaUpper = nama.toUpperCase();
  if (namaUpper.includes("SMK") || namaUpper.includes("SMKN")) {
    return "SMK";
  }
  if (namaUpper.includes("SLB") || namaUpper.includes("SDLB") || namaUpper.includes("SMPLB") || namaUpper.includes("SMALB")) {
    return "SLB";
  }
  // Default to SMA for SMA, SMAN, MA, MAN, etc.
  return "SMA";
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const kota = formData.get("kota") as string;

    const logs: ImportLog[] = [];

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan", logs }, { status: 400 });
    }

    if (!kota || !["kota_malang", "kota_batu"].includes(kota)) {
      return NextResponse.json({ error: "Pilih kota yang valid", logs }, { status: 400 });
    }

    logs.push({
      step: "Memulai import",
      status: "processing",
      message: `File: ${file.name}, Kota: ${kota === "kota_malang" ? "Kota Malang" : "Kota Batu"}`,
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

    for (let i = 0; i < jsonData.length; i++) {
      const row: any = jsonData[i];
      const rowNum = i + 2; // Excel row number (1-indexed + header)

      // Handle different possible column names
      const nama = (row["Nama Satuan Pendidikan"] || row["Nama Sekolah"] || row["nama"] || "").toString().trim();
      const npsn = String(row["NPSN"] || row["npsn"] || "").trim();
      const statusRaw = (row["Status Sekolah"] || row["Status"] || row["status"] || "").toString().toLowerCase();
      const alamat = (row["Alamat"] || row["alamat"] || "").toString().trim();
      const kepalaSekolah = (row["Nama Kepala Sekolah"] || row["Kepala Sekolah"] || row["kepala_sekolah"] || "").toString().trim();

      if (!nama || !npsn) {
        logs.push({
          step: `Baris ${rowNum}`,
          status: "skipped",
          message: "Nama atau NPSN kosong, dilewati",
        });
        skipped++;
        continue;
      }

      // Determine status
      let status: "negeri" | "swasta" = "swasta";
      if (statusRaw.includes("negeri")) {
        status = "negeri";
      }

      // Detect jenjang from nama
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
        logs.push({
          step: `Baris ${rowNum}`,
          status: "success",
          message: `"${nama}" berhasil diimport`,
          data: `Jenjang: ${jenjang}, Status: ${status === "negeri" ? "Negeri" : "Swasta"}`,
        });
        imported++;
      } catch (error: any) {
        if (error.code === "23505") {
          logs.push({
            step: `Baris ${rowNum}`,
            status: "skipped",
            message: `"${nama}" sudah ada (NPSN: ${npsn})`,
          });
          skipped++;
        } else {
          logs.push({
            step: `Baris ${rowNum}`,
            status: "error",
            message: `Gagal import "${nama}": ${error.message}`,
          });
        }
      }
    }

    logs.push({
      step: "Selesai",
      status: "success",
      message: `Import selesai. Berhasil: ${imported}, Dilewati: ${skipped}`,
    });

    return NextResponse.json({
      message: "Import selesai",
      imported,
      skipped,
      total: jsonData.length,
      logs,
    });
  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat import: " + error.message }, { status: 500 });
  }
}
