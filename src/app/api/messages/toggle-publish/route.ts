import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { getAuthenticatedFingerprint } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // Get fingerprint from authenticated session
    const fingerprint = await getAuthenticatedFingerprint();
    if (!fingerprint) {
      return NextResponse.json(
        { error: "Unauthorized - invalid session" },
        { status: 401 }
      );
    }

    const { cid } = await request.json();

    if (!cid) {
      return NextResponse.json(
        { error: "CID is required" },
        { status: 400 }
      );
    }

    // Verify the message belongs to this fingerprint
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

    // Toggle the public status
    const [updated] = await db
      .update(messages)
      .set({ isPublic: !message.isPublic })
      .where(eq(messages.cid, cid))
      .returning({ isPublic: messages.isPublic });

    return NextResponse.json({ isPublic: updated.isPublic });
  } catch (error) {
    console.error("Error in POST /api/messages/toggle-publish:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
