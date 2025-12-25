import { NextRequest, NextResponse } from "next/server";
import { db, sekolah } from "@/lib/db";
import { eq, desc, ilike, and, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { createSekolahSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const kota = searchParams.get("kota") || "";
    const all = searchParams.get("all") === "true";

    const conditions = [];
    if (search) {
      conditions.push(ilike(sekolah.nama, `%${search}%`));
    }
    if (status && status !== "all") {
      conditions.push(eq(sekolah.status, status as "negeri" | "swasta"));
    }
    if (kota && kota !== "all") {
      conditions.push(eq(sekolah.kota, kota as "kota_malang" | "kota_batu"));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    if (all) {
      const data = await db.query.sekolah.findMany({
        where: whereClause,
        orderBy: [desc(sekolah.createdAt)],
      });
      return NextResponse.json({ data });
    }

    const offset = (page - 1) * limit;

    const [data, countResult] = await Promise.all([
      db.query.sekolah.findMany({
        where: whereClause,
        with: { gtkList: true },
        orderBy: [desc(sekolah.createdAt)],
        limit,
        offset,
      }),
      db.select({ count: sql<number>`count(*)` }).from(sekolah).where(whereClause),
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
    console.error("Get sekolah error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createSekolahSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const existing = await db.query.sekolah.findFirst({
      where: eq(sekolah.npsn, validation.data.npsn),
    });

    if (existing) {
      return NextResponse.json({ error: "NPSN sudah terdaftar" }, { status: 400 });
    }

    const [newSekolah] = await db.insert(sekolah).values(validation.data).returning();

    return NextResponse.json(newSekolah, { status: 201 });
  } catch (error) {
    console.error("Create sekolah error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
