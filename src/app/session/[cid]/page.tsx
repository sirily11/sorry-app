import { cookies } from "next/headers";
import { createHmac } from "crypto";
import { SessionView } from "./session-view";
import { getBaseUrl } from "@/lib/utils.server";
import { verifySessionOwnership } from "@/app/actions";

// Verify and extract fingerprint from signed token
function verifyFingerprint(token: string): string | null {
  const [fingerprint, signature] = token.split(".");
  if (!fingerprint || !signature) return null;

  const secret =
    process.env.COOKIE_SECRET || "fallback-secret-change-in-production";
  const hmac = createHmac("sha256", secret);
  hmac.update(fingerprint);
  const expectedSignature = hmac.digest("hex");

  if (signature !== expectedSignature) return null;
  return fingerprint;
}

// Unauthorized component
function Unauthorized() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">401</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Unauthorized
        </h2>
        <p className="text-gray-600 mb-6">
          You don't have permission to view this session.
        </p>
        <a
          href="/"
          className="px-6 py-3 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 transition-colors inline-block"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
}

export default async function SessionPage({
  params,
}: {
  params: Promise<{ cid: string }>;
}) {
  const { cid } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("apology_session")?.value;

  // If no auth cookie, return unauthorized
  if (!token) {
    return <Unauthorized />;
  }

  // Extract fingerprint from signed token
  const fingerprint = verifyFingerprint(token);
  if (!fingerprint) {
    return <Unauthorized />;
  }

  // Verify ownership - only the creator can access the session
  const ownershipResult = await verifySessionOwnership(cid, fingerprint);
  if (!ownershipResult.isOwner) {
    return <Unauthorized />;
  }

  const baseUrl = getBaseUrl();

  return <SessionView cid={cid} fingerprint={fingerprint} baseUrl={baseUrl} />;
}
