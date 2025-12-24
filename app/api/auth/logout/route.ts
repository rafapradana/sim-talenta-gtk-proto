import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteRefreshToken } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (refreshToken) {
      await deleteRefreshToken(refreshToken);
    }

    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");

    return NextResponse.json({ message: "Logout berhasil" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
