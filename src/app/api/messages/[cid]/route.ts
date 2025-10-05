import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { getAuthenticatedFingerprint } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cid: string }> }
) {
  try {
    // Get fingerprint from authenticated session
    const fingerprint = await getAuthenticatedFingerprint();
    if (!fingerprint) {
      return NextResponse.json(
        { error: "Unauthorized - invalid session" },
        { status: 401 }
      );
    }

    const { cid } = await params;

    // Fetch the message from database
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.cid, cid));

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    if (message.fingerprint !== fingerprint) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      cid: message.cid,
      scenario: message.scenario,
      content: message.content,
      isPublic: message.isPublic,
    });
  } catch (error) {
    console.error("Error in GET /api/messages/[cid]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
