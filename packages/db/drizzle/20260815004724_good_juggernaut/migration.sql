CREATE TYPE "employee_range" AS ENUM('1-10', '11-50', '51-250', '251-1K', '1K-5K', '5K-10K', '10K+');--> statement-breakpoint
CREATE TYPE "revenue_range" AS ENUM('<$1M', '$1M-10M', '$10M-50M', '$50M-100M', '$100M-500M', '$500M-1B', '$1B-5B', '$5B+');--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"deal_counter" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "companies" DROP CONSTRAINT "companies_domain_key";--> statement-breakpoint
-- Hand-edited: drizzle-kit emits this as ADD COLUMN ... NOT NULL, which fails
-- outright on any database that already holds companies. Added nullable,
-- backfilled, then constrained.
ALTER TABLE "companies" ADD COLUMN "workspace_id" uuid;--> statement-breakpoint
-- Existing rows predate workspaces and need a home. A fresh database has no
-- companies, so this inserts nothing and the default workspace is created by
-- signup instead.
INSERT INTO "workspaces" ("name", "slug")
SELECT 'Default', 'default'
WHERE EXISTS (SELECT 1 FROM "companies");--> statement-breakpoint
UPDATE "companies"
SET "workspace_id" = (SELECT "id" FROM "workspaces" WHERE "slug" = 'default')
WHERE "workspace_id" IS NULL;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "workspace_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "employees" "employee_range";--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "revenue" "revenue_range";--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "funding" bigint;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "socials" jsonb;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "manual_fields" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "companies_workspace_id_domain_idx" ON "companies" ("workspace_id","domain");--> statement-breakpoint
CREATE INDEX "companies_workspace_id_name_idx" ON "companies" ("workspace_id","name");--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;