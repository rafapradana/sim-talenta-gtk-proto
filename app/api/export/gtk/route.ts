import { NextRequest, NextResponse } from "next/server";
import { db, gtk } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["super_admin", "admin_sekolah"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const sekolahId = searchParams.get("sekolahId");

    let conditions = undefined;

    // Admin sekolah hanya bisa export GTK di sekolahnya
    if (currentUser.role === "admin_sekolah") {
      const adminGtk = await db.query.gtk.findFirst({
        where: eq(gtk.userId, currentUser.userId),
      });
      if (adminGtk?.sekolahId) {
        conditions = eq(gtk.sekolahId, adminGtk.sekolahId);
      }
    } else if (sekolahId) {
      conditions = eq(gtk.sekolahId, sekolahId);
    }

    const data = await db.query.gtk.findMany({
      where: conditions,
      with: { user: true, sekolah: true, talentaList: true },
    });

    if (format === "csv") {
      const headers = ["Nama Lengkap", "NUPTK", "NIP", "Jenis Kelamin", "Tanggal Lahir", "Jenis", "Jabatan", "Sekolah", "Email", "Jumlah Talenta"];
      const rows = data.map((g) => [
        g.namaLengkap,
        g.nuptk || "",
        g.nip || "",
        g.kelamin === "L" ? "Laki-laki" : "Perempuan",
        g.tanggalLahir,
        g.jenis === "guru" ? "Guru" : g.jenis === "tendik" ? "Tendik" : "Kepala Sekolah",
        g.jabatan || "",
        g.sekolah?.nama || "",
        g.user?.email || "",
        g.talentaList?.length || 0,
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="data-gtk-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // JSON format for other uses
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
