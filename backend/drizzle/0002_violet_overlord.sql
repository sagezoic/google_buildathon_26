CREATE TABLE "property_token_txs" (
	"id" serial PRIMARY KEY NOT NULL,
	"token_id" text NOT NULL,
	"kind" text NOT NULL,
	"version" integer NOT NULL,
	"doc_root" text NOT NULL,
	"tx_hash" text NOT NULL,
	"block_number" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"property_id" text NOT NULL,
	"token_id" text NOT NULL,
	"property_key" text NOT NULL,
	"jurisdiction" text NOT NULL,
	"parcel" text NOT NULL,
	"owner_ref" text NOT NULL,
	"doc_root" text NOT NULL,
	"doc_count" integer NOT NULL,
	"manifest" jsonb NOT NULL,
	"proofs" jsonb NOT NULL,
	"metadata_hash" text NOT NULL,
	"metadata_gcs_path" text NOT NULL,
	"attestation" text NOT NULL,
	"approved_by" text NOT NULL,
	"approved_at" timestamp with time zone NOT NULL,
	"network" text NOT NULL,
	"chain_id" integer NOT NULL,
	"contract_address" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"tx_hash" text,
	"block_number" integer,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "property_tokens_property_id_unique" UNIQUE("property_id"),
	CONSTRAINT "property_tokens_token_id_unique" UNIQUE("token_id")
);
--> statement-breakpoint
ALTER TABLE "property_token_txs" ADD CONSTRAINT "property_token_txs_token_id_property_tokens_token_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."property_tokens"("token_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_tokens" ADD CONSTRAINT "property_tokens_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "property_token_txs_token_idx" ON "property_token_txs" USING btree ("token_id");--> statement-breakpoint
CREATE INDEX "property_tokens_doc_root_idx" ON "property_tokens" USING btree ("doc_root");