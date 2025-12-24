import { NextRequest, NextResponse } from "next/server";
import { db, talenta, gtk } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { updateTalentaSchema } from "@/lib/validations";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const data = await db.query.talenta.findFirst({
      where: eq(talenta.id, id),
      with: { gtk: { with: { sekolah: true, user: true } }, verifier: true },
    });

    if (!data) {
      return NextResponse.json({ error: "Talenta tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Get talenta error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateTalentaSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const existingTalenta = await db.query.talenta.findFirst({
      where: eq(talenta.id, id),
      with: { gtk: true },
    });

    if (!existingTalenta) {
      return NextResponse.json({ error: "Talenta tidak ditemukan" }, { status: 404 });
    }

    // GTK hanya bisa update talenta miliknya sendiri
    if (currentUser.role === "gtk") {
      const userGtk = await db.query.gtk.findFirst({
        where: eq(gtk.userId, currentUser.userId),
      });
      if (!userGtk || userGtk.id !== existingTalenta.gtkId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const [updated] = await db
      .update(talenta)
      .set({ ...validation.data, updatedAt: new Date() })
      .where(eq(talenta.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update talenta error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingTalenta = await db.query.talenta.findFirst({
      where: eq(talenta.id, id),
    });

    if (!existingTalenta) {
      return NextResponse.json({ error: "Talenta tidak ditemukan" }, { status: 404 });
    }

    // GTK hanya bisa hapus talenta miliknya sendiri
    if (currentUser.role === "gtk") {
      const userGtk = await db.query.gtk.findFirst({
        where: eq(gtk.userId, currentUser.userId),
      });
      if (!userGtk || userGtk.id !== existingTalenta.gtkId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    await db.delete(talenta).where(eq(talenta.id, id));

    return NextResponse.json({ message: "Talenta berhasil dihapus" });
  } catch (error) {
    console.error("Delete talenta error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
