import { NextRequest, NextResponse } from "next/server";
import { db, users, gtk } from "@/lib/db";
import { eq, desc, ilike, and, sql } from "drizzle-orm";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { createGtkSchema } from "@/lib/validations";

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
    const jenis = searchParams.get("jenis") || "";
    const sekolahId = searchParams.get("sekolahId") || "";
    const all = searchParams.get("all") === "true";

    const conditions = [];
    if (search) {
      conditions.push(ilike(gtk.namaLengkap, `%${search}%`));
    }
    if (jenis && jenis !== "all") {
      conditions.push(eq(gtk.jenis, jenis as "guru" | "tendik" | "kepala_sekolah"));
    }
    if (sekolahId) {
      conditions.push(eq(gtk.sekolahId, sekolahId));
    }

    // Admin sekolah hanya bisa lihat GTK di sekolahnya
    if (currentUser.role === "admin_sekolah") {
      const adminGtk = await db.query.gtk.findFirst({
        where: eq(gtk.userId, currentUser.userId),
      });
      if (adminGtk?.sekolahId) {
        conditions.push(eq(gtk.sekolahId, adminGtk.sekolahId));
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    if (all) {
      const data = await db.query.gtk.findMany({
        where: whereClause,
        with: { user: true, sekolah: true },
        orderBy: [desc(gtk.createdAt)],
      });
      return NextResponse.json({ data: data.map((g) => ({ ...g, user: { ...g.user, password: undefined } })) });
    }

    const offset = (page - 1) * limit;

    const [data, countResult] = await Promise.all([
      db.query.gtk.findMany({
        where: whereClause,
        with: { user: true, sekolah: true, talentaList: true },
        orderBy: [desc(gtk.createdAt)],
        limit,
        offset,
      }),
      db.select({ count: sql<number>`count(*)` }).from(gtk).where(whereClause),
    ]);

    const total = Number(countResult[0]?.count || 0);

    return NextResponse.json({
      data: data.map((g) => ({ ...g, user: { ...g.user, password: undefined } })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get gtk error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["super_admin", "admin_sekolah"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createGtkSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { email, password, ...gtkData } = validation.data;

    // Check email exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    // Check NUPTK/NIP unique
    if (gtkData.nuptk) {
      const existingNuptk = await db.query.gtk.findFirst({
        where: eq(gtk.nuptk, gtkData.nuptk),
      });
      if (existingNuptk) {
        return NextResponse.json({ error: "NUPTK sudah terdaftar" }, { status: 400 });
      }
    }

    if (gtkData.nip) {
      const existingNip = await db.query.gtk.findFirst({
        where: eq(gtk.nip, gtkData.nip),
      });
      if (existingNip) {
        return NextResponse.json({ error: "NIP sudah terdaftar" }, { status: 400 });
      }
    }

    const hashedPassword = await hashPassword(password);

    // Create user first
    const [newUser] = await db
      .insert(users)
      .values({ email, password: hashedPassword, role: "gtk" })
      .returning();

    // Create GTK
    const [newGtk] = await db
      .insert(gtk)
      .values({ ...gtkData, userId: newUser.id })
      .returning();

    return NextResponse.json({ ...newGtk, user: { ...newUser, password: undefined } }, { status: 201 });
  } catch (error) {
    console.error("Create gtk error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
