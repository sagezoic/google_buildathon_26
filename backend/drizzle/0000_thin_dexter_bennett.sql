CREATE TABLE "bhk_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"society_id" text NOT NULL,
	"bhk" integer NOT NULL,
	"buy_median" double precision,
	"buy_min" double precision,
	"buy_max" double precision,
	"buy_n" integer,
	"rent_median" double precision,
	"rent_min" double precision,
	"rent_max" double precision,
	"rent_n" integer,
	"psf" double precision,
	"flags" jsonb
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"society_id" text NOT NULL,
	"mode" text NOT NULL,
	"bhk" integer,
	"price" double precision,
	"sqft" double precision,
	"psf" double precision,
	"furnished" text,
	"floor" text,
	"posted_at" text
);
--> statement-breakpoint
CREATE TABLE "pois" (
	"id" serial PRIMARY KEY NOT NULL,
	"city" text NOT NULL,
	"type" text NOT NULL,
	"name" text,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"society_id" text NOT NULL,
	"title" text,
	"text" text NOT NULL,
	"date" text,
	"author" text,
	"rating" double precision
);
--> statement-breakpoint
CREATE TABLE "scrape_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"city" text NOT NULL,
	"stage" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"counts" jsonb,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "societies" (
	"id" text PRIMARY KEY NOT NULL,
	"city" text NOT NULL,
	"name" text NOT NULL,
	"developer" text,
	"locality" text,
	"pincode" text,
	"lat" double precision,
	"lng" double precision,
	"kind" text,
	"status" text,
	"possession" text,
	"rera_id" text,
	"units" integer,
	"towers" integer,
	"acres" double precision,
	"price_min" double precision,
	"price_max" double precision,
	"psf_now" double precision,
	"amenities" text[],
	"config_text" text,
	"url" text,
	"brochure_url" text,
	"images" jsonb,
	"rating" double precision,
	"rating_count" integer,
	"review_count" integer,
	"ratings" jsonb,
	"locality_rating" double precision,
	"trend" jsonb,
	"description" text,
	"nearby" jsonb,
	"score" double precision,
	"score_parts" jsonb,
	"scraped_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "unit_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"society_id" text NOT NULL,
	"bhk" integer,
	"label" text,
	"size_sqft" double precision,
	"price_min" double precision,
	"price_max" double precision,
	"plan_images" jsonb
);
--> statement-breakpoint
ALTER TABLE "bhk_prices" ADD CONSTRAINT "bhk_prices_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_types" ADD CONSTRAINT "unit_types_society_id_societies_id_fk" FOREIGN KEY ("society_id") REFERENCES "public"."societies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bhk_prices_society_id_idx" ON "bhk_prices" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "listings_society_id_idx" ON "listings" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "listings_society_mode_idx" ON "listings" USING btree ("society_id","mode");--> statement-breakpoint
CREATE INDEX "pois_city_type_idx" ON "pois" USING btree ("city","type");--> statement-breakpoint
CREATE INDEX "reviews_society_id_idx" ON "reviews" USING btree ("society_id");--> statement-breakpoint
CREATE INDEX "societies_city_locality_idx" ON "societies" USING btree ("city","locality");--> statement-breakpoint
CREATE INDEX "societies_city_kind_idx" ON "societies" USING btree ("city","kind");--> statement-breakpoint
CREATE INDEX "societies_city_price_min_idx" ON "societies" USING btree ("city","price_min");--> statement-breakpoint
CREATE INDEX "unit_types_society_id_idx" ON "unit_types" USING btree ("society_id");