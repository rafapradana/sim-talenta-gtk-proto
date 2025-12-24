import { NextRequest, NextResponse } from "next/server";
import { db, talenta, gtk } from "@/lib/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { createTalentaSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const gtkId = searchParams.get("gtkId") || "";
    const jenis = searchParams.get("jenis") || "";
    const verified = searchParams.get("verified") || "";

    const conditions = [];
    if (gtkId) {
      conditions.push(eq(talenta.gtkId, gtkId));
    }
    if (jenis && jenis !== "all") {
      conditions.push(eq(talenta.jenis, jenis as "peserta_pelatihan" | "pembimbing_lomba" | "peserta_lomba" | "minat_bakat"));
    }
    if (verified === "true") {
      conditions.push(eq(talenta.isVerified, true));
    } else if (verified === "false") {
      conditions.push(eq(talenta.isVerified, false));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (page - 1) * limit;

    const [data, countResult] = await Promise.all([
      db.query.talenta.findMany({
        where: whereClause,
        with: { gtk: { with: { sekolah: true } } },
        orderBy: [desc(talenta.createdAt)],
        limit,
        offset,
      }),
      db.select({ count: sql<number>`count(*)` }).from(talenta).where(whereClause),
    ]);

    const total = Number(countResult[0]?.count || 0);

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get talenta error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createTalentaSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    // GTK hanya bisa tambah talenta untuk dirinya sendiri
    if (currentUser.role === "gtk") {
      const userGtk = await db.query.gtk.findFirst({
        where: eq(gtk.userId, currentUser.userId),
      });
      if (!userGtk || userGtk.id !== validation.data.gtkId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const [newTalenta] = await db.insert(talenta).values(validation.data).returning();

    return NextResponse.json(newTalenta, { status: 201 });
  } catch (error) {
    console.error("Create talenta error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
