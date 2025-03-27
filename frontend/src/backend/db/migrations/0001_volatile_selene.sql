CREATE TABLE "repositories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"owner" text NOT NULL,
	"repo_url" text NOT NULL,
	"private" boolean DEFAULT false,
	"pat_token" text,
	"status" text DEFAULT 'pending',
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "repositories_repo_url_unique" UNIQUE("repo_url")
);
--> statement-breakpoint
ALTER TABLE "repo" RENAME TO "documents";--> statement-breakpoint
DROP INDEX "embedding_index";--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "embedding" SET DATA TYPE vector(1536);--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "repository_id" uuid;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "file_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "embedding_idx" ON "documents" USING ivfflat ("embedding" vector_cosine_ops);--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "updated_at";