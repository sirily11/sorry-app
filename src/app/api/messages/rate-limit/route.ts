import { NextResponse } from "next/server";
import { RATE_LIMIT_MAX } from "@/lib/ratelimit";

export async function GET() {
  try {
    return NextResponse.json({ max: RATE_LIMIT_MAX });
  } catch (error) {
    console.error("Error in GET /api/messages/rate-limit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
