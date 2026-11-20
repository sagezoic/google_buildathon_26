CREATE TABLE "properties" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"gat" text,
	"village" text,
	"taluka" text,
	"district" text,
	"address" text,
	"lat" double precision,
	"lng" double precision,
	"area" text,
	"area_unit" text,
	"stage" text DEFAULT 'details' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"property_id" text NOT NULL,
	"slot" text NOT NULL,
	"filename" text NOT NULL,
	"mime" text NOT NULL,
	"size" integer NOT NULL,
	"gcs_path" text NOT NULL,
	"status" text DEFAULT 'uploaded' NOT NULL,
	"pages" integer,
	"detected_lang" text,
	"original_text" text,
	"translated_text" text,
	"fields" jsonb,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "property_documents" ADD CONSTRAINT "property_documents_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "property_documents_property_id_idx" ON "property_documents" USING btree ("property_id");