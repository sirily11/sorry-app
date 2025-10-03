import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { PostcardView } from "./postcard-view";
import { Metadata } from "next";

/**
 * Generates metadata for the message page
 * @param params - The route parameters containing the message CID
 * @returns Metadata object with title and description
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ cid: string }>;
}): Promise<Metadata> {
  const { cid } = await params;

  // Fetch the message from database
  const [message] = await db
    .select()
    .from(messages)
    .where(eq(messages.cid, cid));

  // If message doesn't exist or is not public, return default metadata
  if (!message || !message.isPublic) {
    return {
      title: "I am sorry",
      description: "Sorry message not found",
    };
  }

  // Create description from first 20 words of message content
  const words = message.content.split(" ");
  const description =
    words.length > 20 ? words.slice(0, 20).join(" ") + "..." : message.content;

  return {
    title: "I am sorry",
    description,
  };
}

export default async function MessagePage({
  params,
}: {
  params: Promise<{ cid: string }>;
}) {
  const { cid } = await params;

  // Fetch the message from database
  const [message] = await db
    .select()
    .from(messages)
    .where(eq(messages.cid, cid));

  // Show 404 if message doesn't exist or is not public
  if (!message || !message.isPublic) {
    notFound();
  }

  return (
    <PostcardView content={message.content} createdAt={message.createdAt} />
  );
}
