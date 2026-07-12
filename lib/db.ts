import { supabaseAdmin } from "./supabaseAdmin";

// EcoVest's data layer, backed by Supabase (hosted Postgres) instead of the
// local node:sqlite file this used to be. That local-file approach only ever
// worked for `npm run dev` — Vercel's serverless functions have no
// persistent filesystem, so every request would have started from a fresh,
// empty database. Every function below is now async (network calls to
// Supabase's REST API under the hood), so every caller needs an `await`.
// See supabase/schema.sql for the table definitions this expects.

function unwrap<T>(data: T | null, error: { message: string } | null): T | undefined {
  if (error) throw new Error(error.message);
  return data ?? undefined;
}

export interface UserRow {
  id: string;
  email: string;
  passwordHash: string;
  cashBalance: number;
  createdAt: string;
  firstName: string | null;
  lastName: string | null;
  /** Raw JSON-encoded array of INTEREST_CATEGORIES strings — parse with JSON.parse. */
  interests: string;
  /** SHA-256 hex hash of the current forgot-password token, if any is outstanding. Never the raw token. */
  resetTokenHash: string | null;
  /** ISO timestamp the outstanding reset token expires at, if any. */
  resetTokenExpiresAt: string | null;
}

export async function createUser(email: string, passwordHash: string): Promise<UserRow> {
  const normalizedEmail = email.toLowerCase();
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({
      email: normalizedEmail,
      passwordHash,
      cashBalance: 10000,
      firstName: null,
      lastName: null,
      interests: "[]",
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as UserRow;
}

export async function getUserByEmail(email: string): Promise<UserRow | undefined> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return unwrap(data as UserRow | null, error);
}

export async function getUserById(id: string): Promise<UserRow | undefined> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return unwrap(data as UserRow | null, error);
}

export async function updateUserCash(id: string, cashBalance: number): Promise<void> {
  const { error } = await supabaseAdmin.from("users").update({ cashBalance }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateUserProfile(
  id: string,
  firstName: string,
  lastName: string,
  interests: string[]
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("users")
    .update({ firstName, lastName, interests: JSON.stringify(interests) })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateUserPassword(id: string, passwordHash: string): Promise<void> {
  const { error } = await supabaseAdmin.from("users").update({ passwordHash }).eq("id", id);
  if (error) throw new Error(error.message);
}

// --- Forgot-password reset tokens -----------------------------------------
// One outstanding token per user (setting a new one overwrites any previous
// one, so only the most recently requested reset link works). The raw token
// is only ever held in memory + emailed to the user; only its SHA-256 hash
// is stored, mirroring the "never store the secret itself" principle used
// for passwords (bcrypt hash) elsewhere in this file.

export async function setResetToken(
  id: string,
  tokenHash: string,
  expiresAt: Date
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("users")
    .update({ resetTokenHash: tokenHash, resetTokenExpiresAt: expiresAt.toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getUserByResetTokenHash(tokenHash: string): Promise<UserRow | undefined> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("resetTokenHash", tokenHash)
    .maybeSingle();
  return unwrap(data as UserRow | null, error);
}

export async function clearResetToken(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("users")
    .update({ resetTokenHash: null, resetTokenExpiresAt: null })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export interface PositionRow {
  id: string;
  userId: string;
  ticker: string;
  shares: number;
}

export async function getPositions(userId: string): Promise<PositionRow[]> {
  const { data, error } = await supabaseAdmin
    .from("positions")
    .select("*")
    .eq("userId", userId)
    .order("ticker", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as PositionRow[]) ?? [];
}

export async function getPosition(userId: string, ticker: string): Promise<PositionRow | undefined> {
  const { data, error } = await supabaseAdmin
    .from("positions")
    .select("*")
    .eq("userId", userId)
    .eq("ticker", ticker)
    .maybeSingle();
  return unwrap(data as PositionRow | null, error);
}

export async function upsertPositionShares(
  userId: string,
  ticker: string,
  shares: number
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("positions")
    .upsert({ userId, ticker, shares }, { onConflict: "userId,ticker" });
  if (error) throw new Error(error.message);
}

export async function deletePosition(userId: string, ticker: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("positions")
    .delete()
    .eq("userId", userId)
    .eq("ticker", ticker);
  if (error) throw new Error(error.message);
}

export async function clearPositions(userId: string): Promise<void> {
  const { error } = await supabaseAdmin.from("positions").delete().eq("userId", userId);
  if (error) throw new Error(error.message);
}

export interface TransactionRow {
  id: string;
  userId: string;
  ticker: string;
  side: string;
  shares: number;
  price: number;
  cashAfter: number;
  createdAt: string;
}

export async function insertTransaction(entry: {
  userId: string;
  ticker: string;
  side: "BUY" | "SELL" | "BONUS";
  shares: number;
  price: number;
  cashAfter: number;
}): Promise<void> {
  const { error } = await supabaseAdmin.from("transactions").insert({
    userId: entry.userId,
    ticker: entry.ticker,
    side: entry.side,
    shares: entry.shares,
    price: entry.price,
    cashAfter: entry.cashAfter,
  });
  if (error) throw new Error(error.message);
}

export async function getTransactions(userId: string): Promise<TransactionRow[]> {
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as TransactionRow[]) ?? [];
}
