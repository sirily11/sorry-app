import { NextResponse } from "next/server";
import { ratelimit } from "@/lib/ratelimit";
import { getAuthenticatedFingerprint } from "@/lib/auth";

export async function GET() {
  try {
    // Get fingerprint from authenticated session
    const fingerprint = await getAuthenticatedFingerprint();
    if (!fingerprint) {
      return NextResponse.json(
        { error: "Unauthorized - invalid session" },
        { status: 401 }
      );
    }

    // Get remaining generations without consuming a token
    const { remaining } = await ratelimit.getRemaining(fingerprint);

    return NextResponse.json({ remaining });
  } catch (error) {
    console.error("Error in GET /api/messages/remaining:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
