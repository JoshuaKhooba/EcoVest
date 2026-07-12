import { Resend } from "resend";

// Transactional email — currently just the forgot-password reset link.
// Uses Resend (https://resend.com): a free account + API key is enough to
// send real email, no domain purchase required to get started (Resend's
// shared onboarding@resend.dev sender works out of the box, though check
// your Resend dashboard for any sandbox/testing restrictions on recipients
// before relying on it for a real user base — verify your own domain there
// for unrestricted sending in production).
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "EcoVest <onboarding@resend.dev>";

let cachedClient: Resend | null = null;

function getClient(): Resend {
  if (!RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not set. Create a free account at resend.com, generate an API key, and add it to your environment to enable password-reset emails."
    );
  }
  if (!cachedClient) {
    cachedClient = new Resend(RESEND_API_KEY);
  }
  return cachedClient;
}

export function isEmailConfigured(): boolean {
  return Boolean(RESEND_API_KEY);
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const client = getClient();
  const { error } = await client.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Reset your EcoVest password",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; color: #0f1f38;">
        <p style="font-size: 18px; font-weight: 700; margin-bottom: 4px;">
          <span style="color: #22945c;">Eco</span>Vest
        </p>
        <p style="color: #64748b; font-size: 13px; margin-top: 0;">Portfolio Greenifier — simulated account</p>
        <h2 style="font-size: 18px;">Reset your password</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          We received a request to reset the password on your EcoVest account.
          This link expires in 1 hour and can only be used once.
        </p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #22945c; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
            Reset password
          </a>
        </p>
        <p style="font-size: 13px; color: #94a3b8;">
          If you didn't request this, you can safely ignore this email — your
          password will stay the same.
        </p>
        <p style="font-size: 12px; color: #cbd5e1; margin-top: 32px;">
          EcoVest is a simulated portfolio app. No real money, ever.
        </p>
      </div>
    `,
  });
  if (error) {
    throw new Error(error.message || "Failed to send password reset email.");
  }
}
