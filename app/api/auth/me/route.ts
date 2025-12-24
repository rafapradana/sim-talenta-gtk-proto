import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, users, gtk } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, currentUser.userId),
      with: { gtk: { with: { sekolah: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      gtk: user.gtk,
    });
  } catch (error) {
    console.error("Get me error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
