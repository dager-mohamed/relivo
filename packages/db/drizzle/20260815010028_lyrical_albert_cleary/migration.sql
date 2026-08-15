-- Hand-added: drizzle-kit doesn't emit this, and it must precede the
-- embeddings table's vector(384) column.
CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TYPE "feedback_status" AS ENUM('backlog', 'planned', 'in_progress', 'closed');--> statement-breakpoint
CREATE TYPE "next_step_source" AS ENUM('manual', 'ai_suggested', 'playbook');--> statement-breakpoint
CREATE TYPE "embedding_source" AS ENUM('note', 'activity_event', 'email');--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspace_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "feedback_status" DEFAULT 'backlog'::"feedback_status" NOT NULL,
	"external_issue_key" text,
	"external_issue_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback_companies" (
	"feedback_id" uuid,
	"company_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feedback_companies_pkey" PRIMARY KEY("feedback_id","company_id")
);
--> statement-breakpoint
CREATE TABLE "feedback_deals" (
	"feedback_id" uuid,
	"deal_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feedback_deals_pkey" PRIMARY KEY("feedback_id","deal_id")
);
--> statement-breakpoint
CREATE TABLE "feedback_votes" (
	"feedback_id" uuid,
	"user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feedback_votes_pkey" PRIMARY KEY("feedback_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "next_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspace_id" uuid NOT NULL,
	"deal_id" uuid NOT NULL,
	"title" text NOT NULL,
	"due_date" date NOT NULL,
	"completed_at" timestamp with time zone,
	"snoozed_until" timestamp with time zone,
	"assignee_id" text,
	"source" "next_step_source" DEFAULT 'manual'::"next_step_source" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspace_id" uuid NOT NULL,
	"company_id" uuid,
	"deal_id" uuid,
	"person_id" uuid,
	"actor_id" text,
	"action" text NOT NULL,
	"target_type" text,
	"target_id" uuid,
	"data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "activity_events_one_subject_check" CHECK (("company_id" IS NOT NULL)::int + ("deal_id" IS NOT NULL)::int + ("person_id" IS NOT NULL)::int = 1)
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspace_id" uuid NOT NULL,
	"company_id" uuid,
	"deal_id" uuid,
	"person_id" uuid,
	"author_id" text,
	"body" jsonb NOT NULL,
	"body_text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notes_one_subject_check" CHECK (("company_id" IS NOT NULL)::int + ("deal_id" IS NOT NULL)::int + ("person_id" IS NOT NULL)::int = 1)
);
--> statement-breakpoint
CREATE TABLE "embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspace_id" uuid NOT NULL,
	"deal_id" uuid,
	"company_id" uuid,
	"source" "embedding_source" NOT NULL,
	"source_id" uuid NOT NULL,
	"content" text NOT NULL,
	"content_hash" text NOT NULL,
	"model" text NOT NULL,
	"dimensions" integer NOT NULL,
	"embedding" vector(384) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspace_id" uuid NOT NULL,
	"user_id" text,
	"feature" text NOT NULL,
	"model" text NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"cached_input_tokens" integer DEFAULT 0 NOT NULL,
	"cost_micro_usd" bigint DEFAULT 0 NOT NULL,
	"latency_ms" integer DEFAULT 0 NOT NULL,
	"success" boolean NOT NULL,
	"error_reason" text,
	"cache_hit" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "feedback_workspace_id_status_idx" ON "feedback" ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "feedback_companies_company_id_idx" ON "feedback_companies" ("company_id");--> statement-breakpoint
CREATE INDEX "feedback_deals_deal_id_idx" ON "feedback_deals" ("deal_id");--> statement-breakpoint
CREATE INDEX "next_steps_deal_id_due_date_idx" ON "next_steps" ("deal_id","due_date") WHERE "completed_at" IS NULL;--> statement-breakpoint
CREATE INDEX "next_steps_workspace_id_due_date_idx" ON "next_steps" ("workspace_id","due_date") WHERE "completed_at" IS NULL;--> statement-breakpoint
CREATE INDEX "activity_events_deal_id_created_at_idx" ON "activity_events" ("deal_id","created_at");--> statement-breakpoint
CREATE INDEX "activity_events_company_id_created_at_idx" ON "activity_events" ("company_id","created_at");--> statement-breakpoint
CREATE INDEX "activity_events_person_id_created_at_idx" ON "activity_events" ("person_id","created_at");--> statement-breakpoint
CREATE INDEX "notes_deal_id_created_at_idx" ON "notes" ("deal_id","created_at");--> statement-breakpoint
CREATE INDEX "notes_company_id_created_at_idx" ON "notes" ("company_id","created_at");--> statement-breakpoint
CREATE INDEX "notes_person_id_created_at_idx" ON "notes" ("person_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "embeddings_source_model_idx" ON "embeddings" ("source","source_id","model");--> statement-breakpoint
CREATE INDEX "embeddings_workspace_id_deal_id_idx" ON "embeddings" ("workspace_id","deal_id");--> statement-breakpoint
CREATE INDEX "ai_usage_workspace_id_feature_created_at_idx" ON "ai_usage" ("workspace_id","feature","created_at");--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "feedback_companies" ADD CONSTRAINT "feedback_companies_feedback_id_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedback"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "feedback_companies" ADD CONSTRAINT "feedback_companies_company_id_companies_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "feedback_deals" ADD CONSTRAINT "feedback_deals_feedback_id_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedback"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "feedback_deals" ADD CONSTRAINT "feedback_deals_deal_id_deals_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "feedback_votes" ADD CONSTRAINT "feedback_votes_feedback_id_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedback"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "feedback_votes" ADD CONSTRAINT "feedback_votes_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "next_steps" ADD CONSTRAINT "next_steps_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "next_steps" ADD CONSTRAINT "next_steps_deal_id_deals_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "next_steps" ADD CONSTRAINT "next_steps_assignee_id_user_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_company_id_companies_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_deal_id_deals_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_person_id_people_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_actor_id_user_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_company_id_companies_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_deal_id_deals_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_person_id_people_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_author_id_user_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_deal_id_deals_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_company_id_companies_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
-- Hand-written: drizzle-kit regenerates HNSW DDL without the operator class,
-- and Postgres rejects the result. An index built with the wrong opclass is
-- never chosen by the planner — no error, just a sequential scan.
CREATE INDEX "embeddings_embedding_hnsw_idx"
  ON "embeddings" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
-- BEFORE UPDATE only — DELETE stays legal so the cascades above still work.
CREATE OR REPLACE FUNCTION "activity_events_reject_update"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'activity_events rows are immutable and cannot be updated';
END;
$$;--> statement-breakpoint
CREATE TRIGGER "activity_events_immutable"
  BEFORE UPDATE ON "activity_events"
  FOR EACH ROW EXECUTE FUNCTION "activity_events_reject_update"();