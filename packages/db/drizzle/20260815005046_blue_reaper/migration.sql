CREATE TYPE "deal_stage_type" AS ENUM('open', 'won', 'lost');--> statement-breakpoint
CREATE TABLE "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspace_id" uuid NOT NULL,
	"company_id" uuid,
	"name" text,
	"email" text,
	"phone" text,
	"role" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "people_name_or_email_check" CHECK ("name" IS NOT NULL OR "email" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "deal_contacts" (
	"deal_id" uuid,
	"person_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "deal_contacts_pkey" PRIMARY KEY("deal_id","person_id")
);
--> statement-breakpoint
CREATE TABLE "deal_stages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" "deal_stage_type" DEFAULT 'open'::"deal_stage_type" NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspace_id" uuid NOT NULL,
	"number" integer NOT NULL,
	"name" text NOT NULL,
	"company_id" uuid NOT NULL,
	"value" bigint,
	"close_date" date,
	"stage_id" uuid NOT NULL,
	"owner_id" text,
	"primary_contact_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "people_workspace_id_email_idx" ON "people" ("workspace_id","email");--> statement-breakpoint
CREATE INDEX "people_workspace_id_company_id_idx" ON "people" ("workspace_id","company_id");--> statement-breakpoint
CREATE INDEX "people_workspace_id_name_idx" ON "people" ("workspace_id","name");--> statement-breakpoint
CREATE INDEX "deal_contacts_person_id_idx" ON "deal_contacts" ("person_id");--> statement-breakpoint
CREATE INDEX "deal_stages_workspace_id_position_idx" ON "deal_stages" ("workspace_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "deals_workspace_id_number_idx" ON "deals" ("workspace_id","number");--> statement-breakpoint
CREATE INDEX "deals_workspace_id_stage_id_idx" ON "deals" ("workspace_id","stage_id");--> statement-breakpoint
CREATE INDEX "deals_company_id_idx" ON "deals" ("company_id");--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_company_id_companies_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "deal_contacts" ADD CONSTRAINT "deal_contacts_deal_id_deals_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "deal_contacts" ADD CONSTRAINT "deal_contacts_person_id_people_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "deal_stages" ADD CONSTRAINT "deal_stages_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_company_id_companies_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_stage_id_deal_stages_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "deal_stages"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_owner_id_user_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_primary_contact_id_people_id_fkey" FOREIGN KEY ("primary_contact_id") REFERENCES "people"("id") ON DELETE SET NULL;