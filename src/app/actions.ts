"use server";

import { streamText } from "ai";
import { createStreamableValue } from "@ai-sdk/rsc";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { ratelimit, RATE_LIMIT_MAX } from "@/lib/ratelimit";
import { setAuthCookie, verifyAuthCookie } from "@/lib/auth";

export async function generateApology(fingerprint: string, scenario: string) {
  if (fingerprint === "") {
    return { error: "Fingerprint is required" };
  }

  if (scenario === "") {
    return { error: "Scenario is required" };
  }

  if (process.env.AI_MODEL_NAME === "") {
    return { error: "AI model name is required" };
  }

  // Check rate limit
  const { success, remaining } = await ratelimit.limit(fingerprint);

  if (!success) {
    return {
      error: `Rate limit exceeded. You can only generate ${RATE_LIMIT_MAX} apologies per day.`,
      remaining: 0,
    };
  }

  // Create a message record first to get the cid
  const [messageRecord] = await db
    .insert(messages)
    .values({
      content: "", // Will be updated after generation
      scenario,
      fingerprint,
      isPublic: false,
    })
    .returning({ cid: messages.cid });

  const cid = messageRecord.cid;

  // Set auth cookie immediately
  await setAuthCookie(fingerprint);

  // Create streamable value for the text
  const stream = createStreamableValue("");

  // Generate the apology message
  (async () => {
    try {
      const { textStream } = streamText({
        model: process.env.AI_MODEL_NAME!,
        system: `You are a heartfelt apology writer. Create sincere, thoughtful apology messages for people who want to say sorry to their girlfriend. The apology should be genuine, take responsibility, show understanding, and express commitment to do better. Keep it concise but meaningful (2-3 paragraphs max).`,
        prompt: `Write a sincere apology message based on this situation: ${scenario}`,
      });

      let fullText = "";
      for await (const delta of textStream) {
        fullText += delta;
        stream.update(delta);
      }

      stream.done();

      // Update the message with the generated content
      await db
        .update(messages)
        .set({ content: fullText })
        .where(eq(messages.cid, cid));
    } catch (error) {
      console.error("Error in generateApology:", error);
      stream.error(error);
    }
  })();

  return {
    output: stream.value,
    cid,
    remaining: remaining - 1,
  };
}

export async function togglePublish(cid: string, fingerprint: string) {
  // Verify the user has a valid auth cookie
  const isAuthenticated = await verifyAuthCookie(fingerprint);
  if (!isAuthenticated) {
    return { error: "Unauthorized - invalid session" };
  }

  // Verify the message belongs to this fingerprint
  const [message] = await db
    .select()
    .from(messages)
    .where(eq(messages.cid, cid));

  if (!message) {
    return { error: "Message not found" };
  }

  if (message.fingerprint !== fingerprint) {
    return { error: "Unauthorized" };
  }

  // Toggle the public status
  const [updated] = await db
    .update(messages)
    .set({ isPublic: !message.isPublic })
    .where(eq(messages.cid, cid))
    .returning({ isPublic: messages.isPublic });

  return { isPublic: updated.isPublic };
}

export async function getRemainingGenerations(fingerprint: string) {
  // Use getRemaining() to check without consuming a token
  const { remaining } = await ratelimit.getRemaining(fingerprint);
  return { remaining };
}

export async function getRateLimitMax() {
  return { max: RATE_LIMIT_MAX };
}
