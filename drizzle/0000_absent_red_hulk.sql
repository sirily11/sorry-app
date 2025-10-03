CREATE TABLE "messages" (
	"cid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"scenario" text NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"fingerprint" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
