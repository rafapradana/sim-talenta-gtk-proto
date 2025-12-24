import { NextRequest, NextResponse } from "next/server";
import { db, gtk, talenta } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

const jenisLabels: Record<string, string> = {
  peserta_pelatihan: "Peserta Pelatihan",
  pembimbing_lomba: "Pembimbing Lomba",
  peserta_lomba: "Peserta Lomba",
  minat_bakat: "Minat/Bakat",
};

const jenjangLabels: Record<string, string> = {
  kota: "Kota",
  provinsi: "Provinsi",
  nasional: "Nasional",
  internasional: "Internasional",
};

const bidangLabels: Record<string, string> = {
  akademik: "Akademik",
  inovasi: "Inovasi",
  teknologi: "Teknologi",
  sosial: "Sosial",
  seni: "Seni",
  kepemimpinan: "Kepemimpinan",
};

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["super_admin", "admin_sekolah"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";

    const data = await db.query.talenta.findMany({
      with: { gtk: { with: { sekolah: true } } },
    });

    // Filter for admin sekolah
    let filteredData = data;
    if (currentUser.role === "admin_sekolah") {
      const adminGtk = await db.query.gtk.findFirst({
        where: eq(gtk.userId, currentUser.userId),
      });
      if (adminGtk?.sekolahId) {
        filteredData = data.filter((t) => t.gtk?.sekolahId === adminGtk.sekolahId);
      }
    }

    if (format === "csv") {
      const headers = ["Nama GTK", "Sekolah", "Jenis Talenta", "Detail", "Jenjang", "Bidang", "Prestasi", "Status Verifikasi"];
      const rows = filteredData.map((t) => {
        let detail = "";
        if (t.jenis === "peserta_pelatihan") {
          detail = t.namaKegiatan || "";
        } else if (t.jenis === "pembimbing_lomba" || t.jenis === "peserta_lomba") {
          detail = t.namaLomba || "";
        } else {
          detail = t.deskripsi || "";
        }

        return [
          t.gtk?.namaLengkap || "",
          t.gtk?.sekolah?.nama || "",
          jenisLabels[t.jenis] || t.jenis,
          detail,
          t.jenjang ? jenjangLabels[t.jenjang] : "",
          t.bidang ? bidangLabels[t.bidang] : "",
          t.prestasi || "",
          t.isVerified ? "Terverifikasi" : "Belum Verifikasi",
        ];
      });

      const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="data-talenta-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ data: filteredData });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
