import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getUserByResetTokenHash, updateUserPassword, clearResetToken } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (typeof token !== "string" || !token) {
      return NextResponse.json({ error: "Missing reset token." }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await getUserByResetTokenHash(tokenHash);

    if (!user || !user.resetTokenExpiresAt) {
      return NextResponse.json(
        { error: "This reset link is invalid. Request a new one." },
        { status: 400 }
      );
    }

    if (new Date(user.resetTokenExpiresAt).getTime() < Date.now()) {
      await clearResetToken(user.id);
      return NextResponse.json(
        { error: "This reset link has expired. Request a new one." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    await updateUserPassword(user.id, passwordHash);
    await clearResetToken(user.id);

    return NextResponse.json({ message: "Password updated. You can log in now." });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong." },
      { status: 500 }
    );
  }
}
