import { NextRequest, NextResponse } from "next/server";
import { db, sekolah } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { updateSekolahSchema } from "@/lib/validations";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const data = await db.query.sekolah.findFirst({
      where: eq(sekolah.id, id),
      with: { kepalaSekolah: true, gtkList: { with: { user: true } } },
    });

    if (!data) {
      return NextResponse.json({ error: "Sekolah tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Get sekolah error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateSekolahSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const [updated] = await db
      .update(sekolah)
      .set({ ...validation.data, updatedAt: new Date() })
      .where(eq(sekolah.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Sekolah tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update sekolah error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [deleted] = await db.delete(sekolah).where(eq(sekolah.id, id)).returning();

    if (!deleted) {
      return NextResponse.json({ error: "Sekolah tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ message: "Sekolah berhasil dihapus" });
  } catch (error) {
    console.error("Delete sekolah error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
