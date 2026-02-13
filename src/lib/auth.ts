import { cookies } from "next/headers";
import { createHmac, createHash } from "crypto";

const COOKIE_NAME = "apology_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Create a signed token from fingerprint
function signFingerprint(fingerprint: string): string {
  const secret = process.env.COOKIE_SECRET || "fallback-secret-change-in-production";
  const hmac = createHmac("sha256", secret);
  hmac.update(fingerprint);
  const signature = hmac.digest("hex");
  return `${fingerprint}.${signature}`;
}

// Verify and extract fingerprint from signed token
function verifyFingerprint(token: string): string | null {
  const [fingerprint, signature] = token.split(".");
  if (!fingerprint || !signature) return null;

  const secret = process.env.COOKIE_SECRET || "fallback-secret-change-in-production";
  const hmac = createHmac("sha256", secret);
  hmac.update(fingerprint);
  const expectedSignature = hmac.digest("hex");

  if (signature !== expectedSignature) return null;
  return fingerprint;
}

export async function setAuthCookie(fingerprint: string) {
  const signedToken = signFingerprint(fingerprint);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function verifyAuthCookie(fingerprint: string): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return false;

  const verifiedFingerprint = verifyFingerprint(token);
  return verifiedFingerprint === fingerprint;
}

// Get fingerprint from authenticated session cookie
export async function getAuthenticatedFingerprint(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  return verifyFingerprint(token);
}

// Generate fingerprint from request metadata (IP, user-agent, etc.)
export function generateFingerprint(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Combine IP and user-agent to create a unique fingerprint
  const hash = createHash("sha256");
  hash.update(`${ip}:${userAgent}`);
  return hash.digest("hex");
}
