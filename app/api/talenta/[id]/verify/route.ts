import { NextRequest, NextResponse } from "next/server";
import { db, talenta } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["super_admin", "admin_sekolah"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [updated] = await db
      .update(talenta)
      .set({
        isVerified: true,
        verifiedBy: currentUser.userId,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(talenta.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Talenta tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Verify talenta error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !["super_admin", "admin_sekolah"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [updated] = await db
      .update(talenta)
      .set({
        isVerified: false,
        verifiedBy: null,
        verifiedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(talenta.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Talenta tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Unverify talenta error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
