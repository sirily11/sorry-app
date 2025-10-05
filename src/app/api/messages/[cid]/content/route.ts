import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { getAuthenticatedFingerprint } from "@/lib/auth";

export async function PATCH(
  request: Request,
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
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
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

    // Update the message content
    await db
      .update(messages)
      .set({ content })
      .where(eq(messages.cid, cid));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PATCH /api/messages/[cid]/content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
