import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const statusLabels: Record<string, string> = {
  negeri: "Negeri",
  swasta: "Swasta",
};

const kotaLabels: Record<string, string> = {
  kota_malang: "Kota Malang",
  kota_batu: "Kota Batu",
};

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";

    const data = await db.query.sekolah.findMany({
      with: {
        gtkList: true,
      },
    });

    if (format === "csv") {
      const headers = [
        "Nama Sekolah",
        "NPSN",
        "Status",
        "Kota",
        "Alamat",
        "Kepala Sekolah",
        "Jumlah GTK",
      ];

      const rows = data.map((s) => [
        s.nama,
        s.npsn,
        statusLabels[s.status] || s.status,
        kotaLabels[s.kota] || s.kota,
        s.alamat.replace(/"/g, '""'),
        s.kepalaSekolah || "-",
        s.gtkList?.length || 0,
      ]);

      const csv = [
        headers.join(","),
        ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
      ].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="data-sekolah-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Export sekolah error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
