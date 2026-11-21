CREATE TABLE "property_chat_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"property_id" text NOT NULL,
	"role" text NOT NULL,
	"text" text NOT NULL,
	"found" boolean,
	"citations" jsonb,
	"model" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_checks" (
	"id" text PRIMARY KEY NOT NULL,
	"property_id" text NOT NULL,
	"kind" text NOT NULL,
	"status" text DEFAULT 'running' NOT NULL,
	"verdict" text,
	"report" jsonb,
	"doc_ids" jsonb NOT NULL,
	"model" text NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "property_chat_messages" ADD CONSTRAINT "property_chat_messages_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_checks" ADD CONSTRAINT "property_checks_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "property_chat_messages_property_id_idx" ON "property_chat_messages" USING btree ("property_id","created_at");--> statement-breakpoint
CREATE INDEX "property_checks_property_id_idx" ON "property_checks" USING btree ("property_id");