import { NextResponse } from "next/server";
import { db, users, sekolah, gtk, talenta } from "@/lib/db";
import { eq, sql, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let sekolahCondition = undefined;

    // Admin sekolah hanya lihat data sekolahnya
    if (currentUser.role === "admin_sekolah") {
      const adminGtk = await db.query.gtk.findFirst({
        where: eq(gtk.userId, currentUser.userId),
      });
      if (adminGtk?.sekolahId) {
        sekolahCondition = eq(gtk.sekolahId, adminGtk.sekolahId);
      }
    }

    const [
      totalUsers,
      totalSekolah,
      totalGtk,
      totalTalenta,
      gtkByJenis,
      talentaByJenis,
      sekolahByStatus,
      recentGtk,
      unverifiedTalenta,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(sekolah),
      sekolahCondition
        ? db.select({ count: sql<number>`count(*)` }).from(gtk).where(sekolahCondition)
        : db.select({ count: sql<number>`count(*)` }).from(gtk),
      sekolahCondition
        ? db
            .select({ count: sql<number>`count(*)` })
            .from(talenta)
            .innerJoin(gtk, eq(talenta.gtkId, gtk.id))
            .where(sekolahCondition)
        : db.select({ count: sql<number>`count(*)` }).from(talenta),
      sekolahCondition
        ? db
            .select({ jenis: gtk.jenis, count: sql<number>`count(*)` })
            .from(gtk)
            .where(sekolahCondition)
            .groupBy(gtk.jenis)
        : db.select({ jenis: gtk.jenis, count: sql<number>`count(*)` }).from(gtk).groupBy(gtk.jenis),
      sekolahCondition
        ? db
            .select({ jenis: talenta.jenis, count: sql<number>`count(*)` })
            .from(talenta)
            .innerJoin(gtk, eq(talenta.gtkId, gtk.id))
            .where(sekolahCondition)
            .groupBy(talenta.jenis)
        : db.select({ jenis: talenta.jenis, count: sql<number>`count(*)` }).from(talenta).groupBy(talenta.jenis),
      db.select({ status: sekolah.status, count: sql<number>`count(*)` }).from(sekolah).groupBy(sekolah.status),
      db.query.gtk.findMany({
        with: { sekolah: true },
        orderBy: (gtk, { desc }) => [desc(gtk.createdAt)],
        limit: 5,
        where: sekolahCondition,
      }),
      sekolahCondition
        ? db
            .select({ count: sql<number>`count(*)` })
            .from(talenta)
            .innerJoin(gtk, eq(talenta.gtkId, gtk.id))
            .where(and(eq(talenta.isVerified, false), sekolahCondition))
        : db.select({ count: sql<number>`count(*)` }).from(talenta).where(eq(talenta.isVerified, false)),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers: Number(totalUsers[0]?.count || 0),
        totalSekolah: Number(totalSekolah[0]?.count || 0),
        totalGtk: Number(totalGtk[0]?.count || 0),
        totalTalenta: Number(totalTalenta[0]?.count || 0),
        unverifiedTalenta: Number(unverifiedTalenta[0]?.count || 0),
      },
      gtkByJenis: gtkByJenis.map((g) => ({ jenis: g.jenis, count: Number(g.count) })),
      talentaByJenis: talentaByJenis.map((t) => ({ jenis: t.jenis, count: Number(t.count) })),
      sekolahByStatus: sekolahByStatus.map((s) => ({ status: s.status, count: Number(s.count) })),
      recentGtk,
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
