import { boolean, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const messages = pgTable('messages', {
  cid: uuid('cid').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  scenario: text('scenario').notNull(),
  title: text('title'),
  summary: text('summary'),
  isPublic: boolean('is_public').notNull().default(false),
  fingerprint: varchar('fingerprint', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
