import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, setResetToken } from "@/lib/db";
import { isValidEmail } from "@/lib/auth";
import { sendPasswordResetEmail, isEmailConfigured } from "@/lib/email";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// Generic, identical response whether or not the email is registered — never
// reveals which emails have EcoVest accounts (avoids user enumeration).
const GENERIC_MESSAGE =
  "If an account exists for that email, we've sent a password reset link.";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (typeof email !== "string" || !isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (!isEmailConfigured()) {
      // Fails loudly for whoever's running the app locally/on Vercel without
      // RESEND_API_KEY set, rather than silently pretending it worked.
      return NextResponse.json(
        {
          error:
            "Password reset emails aren't configured yet. Set RESEND_API_KEY in your environment (see .env.local.example).",
        },
        { status: 503 }
      );
    }

    const user = await getUserByEmail(email);
    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await setResetToken(user.id, tokenHash, expiresAt);

      const resetUrl = new URL("/reset-password", req.nextUrl.origin);
      resetUrl.searchParams.set("token", rawToken);

      // Don't let the user learn anything from email-send failures either —
      // log server-side, still return the generic success message.
      try {
        await sendPasswordResetEmail(user.email, resetUrl.toString());
      } catch (err) {
        console.error("Failed to send password reset email:", err);
      }
    }

    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong." },
      { status: 500 }
    );
  }
}
