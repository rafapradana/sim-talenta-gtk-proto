import { NextRequest, NextResponse } from "next/server";
import { db, sekolah } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import * as XLSX from "xlsx";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const kota = formData.get("kota") as string;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    if (!kota || !["kota_malang", "kota_batu"].includes(kota)) {
      return NextResponse.json({ error: "Pilih kota yang valid" }, { status: 400 });
    }

    // Read Excel file
    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return NextResponse.json({ error: "File Excel kosong" }, { status: 400 });
    }

    // Map Excel columns to database fields
    const sekolahData = jsonData.map((row: any) => {
      // Handle different possible column names
      const nama = row["Nama Satuan Pendidikan"] || row["Nama Sekolah"] || row["nama"] || "";
      const npsn = String(row["NPSN"] || row["npsn"] || "").trim();
      const statusRaw = (row["Status Sekolah"] || row["Status"] || row["status"] || "").toLowerCase();
      const alamat = row["Alamat"] || row["alamat"] || "";
      const kepalaSekolah = row["Nama Kepala Sekolah"] || row["Kepala Sekolah"] || row["kepala_sekolah"] || "";

      // Determine status
      let status: "negeri" | "swasta" = "swasta";
      if (statusRaw.includes("negeri")) {
        status = "negeri";
      }

      return {
        nama: nama.trim(),
        npsn: npsn,
        status,
        kota: kota as "kota_malang" | "kota_batu",
        alamat: alamat.trim(),
        kepalaSekolah: kepalaSekolah.trim() || null,
      };
    }).filter((s) => s.nama && s.npsn); // Filter out empty rows

    if (sekolahData.length === 0) {
      return NextResponse.json({ error: "Tidak ada data valid untuk diimport" }, { status: 400 });
    }

    // Insert data (skip duplicates based on NPSN)
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const data of sekolahData) {
      try {
        await db.insert(sekolah).values(data).onConflictDoNothing();
        imported++;
      } catch (error: any) {
        if (error.code === "23505") {
          // Duplicate NPSN
          skipped++;
        } else {
          errors.push(`${data.nama}: ${error.message}`);
        }
      }
    }

    return NextResponse.json({
      message: `Import selesai`,
      imported,
      skipped,
      total: sekolahData.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat import" }, { status: 500 });
  }
}
