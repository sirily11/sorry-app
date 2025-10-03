import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { messages } from '@/lib/db/schema';
import { PostcardView } from './postcard-view';

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
    <PostcardView
      content={message.content}
      createdAt={message.createdAt}
    />
  );
}
