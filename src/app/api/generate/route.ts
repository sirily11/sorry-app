import { generateText, streamText } from "ai";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { getAuthenticatedFingerprint } from "@/lib/auth";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { cid, customPrompt } = await request.json();

    if (!cid) {
      return NextResponse.json({ error: "CID is required" }, { status: 400 });
    }

    // Fetch the message from database to get the scenario and fingerprint
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.cid, cid));

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Verify the user is authorized to generate for this message
    // Support both cookie-based auth (mobile) and fingerprint-based auth (web)
    const authenticatedFingerprint = await getAuthenticatedFingerprint();
    if (!authenticatedFingerprint || authenticatedFingerprint !== message.fingerprint) {
      return NextResponse.json(
        { error: "Unauthorized - invalid session" },
        { status: 401 }
      );
    }

    if (message.content) {
      // Already generated - return the complete content
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "content",
                content: message.content,
              })}\n\n`
            )
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
          // Build the prompt with custom instructions if provided
          let systemPrompt = `You are a heartfelt apology writer. Create sincere, thoughtful apology messages for people who want to say sorry to their girlfriend. The apology should be genuine, take responsibility, show understanding, and express commitment to do better. Keep it concise but meaningful (2-3 paragraphs max). Keep it human like.`;

          if (customPrompt && customPrompt.trim()) {
            systemPrompt += `\n\nAdditional instructions from the user: ${customPrompt}`;
          }

          const { textStream } = streamText({
            model: process.env.AI_MODEL_NAME!,
            system: systemPrompt,
            prompt: `Write a sincere apology message based on this situation: ${scenario}`,
          });

          let fullText = "";
          for await (const delta of textStream) {
            fullText += delta;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "delta", content: delta })}\n\n`
              )
            );
          }

          // Generate summary
          const summaryGeneration = await generateText({
            model: "google/gemini-2.5-flash-lite",
            system: `Generate a summary of the given text, keep it less than 20 words. Use the same language as the text.`,
            prompt: `Generate a summary of the following text: ${fullText}`,
          });

          // Update the message with the generated content, title, and summary
          await db
            .update(messages)
            .set({
              content: fullText,
              title: "A Heartfelt Apology",
              summary: summaryGeneration.text,
            })
            .where(eq(messages.cid, cid));

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
          );
          controller.close();
        } catch (error) {
          console.error("Error in generation:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: "Generation failed",
              })}\n\n`
            )
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
      { status: 500 }
    );
  }
}
