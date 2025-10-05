import { NextResponse } from "next/server";
import { generateFingerprint, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // Generate fingerprint from request metadata
    const fingerprint = generateFingerprint(request);

    // Set auth cookie
    await setAuthCookie(fingerprint);

    return NextResponse.json({
      success: true,
      fingerprint,
    });
  } catch (error) {
    console.error("Error in POST /api/auth/sign-in/guest:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
