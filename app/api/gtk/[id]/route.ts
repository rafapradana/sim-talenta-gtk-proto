import { NextRequest, NextResponse } from "next/server";
import { db, gtk, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { updateGtkSchema } from "@/lib/validations";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const data = await db.query.gtk.findFirst({
      where: eq(gtk.id, id),
      with: { user: true, sekolah: true, talentaList: true },
    });

    if (!data) {
      return NextResponse.json({ error: "GTK tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ ...data, user: { ...data.user, password: undefined } });
  } catch (error) {
    console.error("Get gtk error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["super_admin", "admin_sekolah"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateGtkSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const [updated] = await db
      .update(gtk)
      .set({ ...validation.data, updatedAt: new Date() })
      .where(eq(gtk.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "GTK tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update gtk error:", error);
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

    const gtkData = await db.query.gtk.findFirst({
      where: eq(gtk.id, id),
    });

    if (!gtkData) {
      return NextResponse.json({ error: "GTK tidak ditemukan" }, { status: 404 });
    }

    // Delete GTK first, then user
    await db.delete(gtk).where(eq(gtk.id, id));
    await db.delete(users).where(eq(users.id, gtkData.userId));

    return NextResponse.json({ message: "GTK berhasil dihapus" });
  } catch (error) {
    console.error("Delete gtk error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
