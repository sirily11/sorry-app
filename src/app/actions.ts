"use server";

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

  // Check rate limit
  const { success, remaining } = await ratelimit.limit(fingerprint);

  if (!success) {
    return {
      error: `Rate limit exceeded. You can only generate ${RATE_LIMIT_MAX} apologies per day.`,
      remaining: 0,
    };
  }

  // Create a message record to get the cid
  const [messageRecord] = await db
    .insert(messages)
    .values({
      content: "", // Will be updated by the API route
      scenario,
      fingerprint,
      isPublic: false,
    })
    .returning({ cid: messages.cid });

  const cid = messageRecord.cid;

  // Set auth cookie immediately
  await setAuthCookie(fingerprint);

  // Return cid immediately without streaming
  return {
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

export async function getMessageForSession(cid: string, fingerprint: string) {
  // Verify the user has a valid auth cookie
  const isAuthenticated = await verifyAuthCookie(fingerprint);
  if (!isAuthenticated) {
    return { error: "Unauthorized - invalid session" };
  }

  // Fetch the message from database
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

  return {
    cid: message.cid,
    scenario: message.scenario,
    content: message.content,
  };
}
