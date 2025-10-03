import { streamText } from "ai";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { cid } = await request.json();

    if (!cid) {
      return NextResponse.json({ error: "CID is required" }, { status: 400 });
    }

    // Fetch the message from database to get the scenario
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.cid, cid));

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 },
      );
    }

    if (message.content) {
      // Already generated - return the complete content
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "content", content: message.content })}\n\n`),
          );
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const scenario = message.scenario;

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const { textStream } = streamText({
            model: process.env.AI_MODEL_NAME!,
            system: `You are a heartfelt apology writer. Create sincere, thoughtful apology messages for people who want to say sorry to their girlfriend. The apology should be genuine, take responsibility, show understanding, and express commitment to do better. Keep it concise but meaningful (2-3 paragraphs max). Keep it human like.`,
            prompt: `Write a sincere apology message based on this situation: ${scenario}`,
          });

          let fullText = "";
          for await (const delta of textStream) {
            fullText += delta;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "delta", content: delta })}\n\n`),
            );
          }

          // Update the message with the generated content
          await db
            .update(messages)
            .set({ content: fullText })
            .where(eq(messages.cid, cid));

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`),
          );
          controller.close();
        } catch (error) {
          console.error("Error in generation:", error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", error: "Generation failed" })}\n\n`),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in POST /api/generate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
