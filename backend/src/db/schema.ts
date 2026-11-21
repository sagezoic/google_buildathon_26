import {
  pgTable,
  text,
  integer,
  doublePrecision,
  timestamp,
  jsonb,
  serial,
  index,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const societies = pgTable(
  'societies',
  {
    id: text('id').primaryKey(), // mb_<psmid>
    city: text('city').notNull(),
    name: text('name').notNull(),
    developer: text('developer'),
    locality: text('locality'),
    pincode: text('pincode'),
    lat: doublePrecision('lat'),
    lng: doublePrecision('lng'),
    kind: text('kind'), // apartment | builder floor | villa | plot | commercial | other
    status: text('status'),
    possession: text('possession'),
    rera_id: text('rera_id'),
    units: integer('units'),
    towers: integer('towers'),
    acres: doublePrecision('acres'),
    price_min: doublePrecision('price_min'),
    price_max: doublePrecision('price_max'),
    psf_now: doublePrecision('psf_now'),
    amenities: text('amenities').array(),
    config_text: text('config_text'),
    url: text('url'),
    brochure_url: text('brochure_url'),
    images: jsonb('images').$type<Array<{ thumb: string; full: string }>>(),
    rating: doublePrecision('rating'),
    rating_count: integer('rating_count'),
    review_count: integer('review_count'),
    ratings: jsonb('ratings').$type<Record<string, number>>(),
    locality_rating: doublePrecision('locality_rating'),
    trend: jsonb('trend').$type<Array<[string, number]>>(),
    description: text('description'),
    nearby: jsonb('nearby').$type<Record<string, { m: number; name?: string; n?: number }>>(),
    score: doublePrecision('score'),
    score_parts: jsonb('score_parts').$type<Record<string, number>>(),
    scraped_at: timestamp('scraped_at', { withTimezone: true }),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('societies_city_locality_idx').on(table.city, table.locality),
    index('societies_city_kind_idx').on(table.city, table.kind),
    index('societies_city_price_min_idx').on(table.city, table.price_min),
  ]
);

export const unitTypes = pgTable(
  'unit_types',
  {
    id: serial('id').primaryKey(),
    society_id: text('society_id')
      .notNull()
      .references(() => societies.id, { onDelete: 'cascade' }),
    bhk: integer('bhk'),
    label: text('label'),
    size_sqft: doublePrecision('size_sqft'),
    price_min: doublePrecision('price_min'),
    price_max: doublePrecision('price_max'),
    plan_images: jsonb('plan_images').$type<string[]>(),
  },
  (table) => [
    index('unit_types_society_id_idx').on(table.society_id),
  ]
);

export const listings = pgTable(
  'listings',
  {
    id: serial('id').primaryKey(),
    society_id: text('society_id')
      .notNull()
      .references(() => societies.id, { onDelete: 'cascade' }),
    mode: text('mode').notNull(), // 'sale' | 'rent'
    bhk: integer('bhk'),
    price: doublePrecision('price'),
    sqft: doublePrecision('sqft'),
    psf: doublePrecision('psf'),
    furnished: text('furnished'),
    floor: text('floor'),
    posted_at: text('posted_at'),
  },
  (table) => [
    index('listings_society_id_idx').on(table.society_id),
    index('listings_society_mode_idx').on(table.society_id, table.mode),
  ]
);

export const bhkPrices = pgTable(
  'bhk_prices',
  {
    id: serial('id').primaryKey(),
    society_id: text('society_id')
      .notNull()
      .references(() => societies.id, { onDelete: 'cascade' }),
    bhk: integer('bhk').notNull(),
    buy_median: doublePrecision('buy_median'),
    buy_min: doublePrecision('buy_min'),
    buy_max: doublePrecision('buy_max'),
    buy_n: integer('buy_n'),
    rent_median: doublePrecision('rent_median'),
    rent_min: doublePrecision('rent_min'),
    rent_max: doublePrecision('rent_max'),
    rent_n: integer('rent_n'),
    psf: doublePrecision('psf'),
    flags: jsonb('flags').$type<Record<string, string>>(),
  },
  (table) => [
    index('bhk_prices_society_id_idx').on(table.society_id),
  ]
);

export const reviews = pgTable(
  'reviews',
  {
    id: serial('id').primaryKey(),
    society_id: text('society_id')
      .notNull()
      .references(() => societies.id, { onDelete: 'cascade' }),
    title: text('title'),
    text: text('text').notNull(),
    date: text('date'),
    author: text('author'),
    rating: doublePrecision('rating'),
  },
  (table) => [
    index('reviews_society_id_idx').on(table.society_id),
  ]
);

export const pois = pgTable(
  'pois',
  {
    id: serial('id').primaryKey(),
    city: text('city').notNull(),
    type: text('type').notNull(), // park | metro | rail | school | hospital | shopping
    name: text('name'),
    lat: doublePrecision('lat').notNull(),
    lng: doublePrecision('lng').notNull(),
  },
  (table) => [
    index('pois_city_type_idx').on(table.city, table.type),
  ]
);

export const scrapeRuns = pgTable(
  'scrape_runs',
  {
    id: text('id').primaryKey(),
    city: text('city').notNull(),
    stage: text('stage').notNull(), // list | projects | osm | build | all
    started_at: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
    finished_at: timestamp('finished_at', { withTimezone: true }),
    counts: jsonb('counts').$type<Record<string, number>>(),
    error: text('error'),
  }
);

export const properties = pgTable('properties', {
  id: text('id').primaryKey(), // prop_<uuid>
  type: text('type').notNull(), // apartment | plot | commercial
  gat: text('gat'),
  village: text('village'),
  taluka: text('taluka'),
  district: text('district'),
  address: text('address'),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  area: text('area'),
  area_unit: text('area_unit'),
  stage: text('stage').notNull().default('details'), // details | documents | checked
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const propertyDocuments = pgTable(
  'property_documents',
  {
    id: text('id').primaryKey(), // doc_<uuid>
    property_id: text('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    slot: text('slot').notNull(), // extract | card | na | mutation | deed | agreement | extra
    filename: text('filename').notNull(),
    mime: text('mime').notNull(),
    size: integer('size').notNull(),
    gcs_path: text('gcs_path').notNull(),
    status: text('status').notNull().default('uploaded'), // uploaded | processing | processed | failed
    pages: integer('pages'),
    detected_lang: text('detected_lang'),
    original_text: text('original_text'),
    translated_text: text('translated_text'),
    fields: jsonb('fields').$type<Record<string, unknown>>(),
    error: text('error'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('property_documents_property_id_idx').on(table.property_id)]
);

/** One Gemini document check of a property. `report` holds the verdict and findings (see modules/ai/types.ts). */
export const propertyChecks = pgTable(
  'property_checks',
  {
    id: text('id').primaryKey(), // chk_<uuid>
    property_id: text('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull(), // resale | under-construction | plot | commercial
    status: text('status').notNull().default('running'), // running | done | failed
    verdict: text('verdict'), // stop | proceed
    report: jsonb('report').$type<Record<string, unknown>>(),
    doc_ids: jsonb('doc_ids').$type<string[]>().notNull(),
    model: text('model').notNull(),
    error: text('error'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('property_checks_property_id_idx').on(table.property_id)]
);

/** Chat about one property's documents. Model replies carry the documents they cite. */
export const propertyChatMessages = pgTable(
  'property_chat_messages',
  {
    id: text('id').primaryKey(), // msg_<uuid>
    property_id: text('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    role: text('role').notNull(), // user | model
    text: text('text').notNull(),
    found: boolean('found'), // model only: false when the documents do not answer the question
    citations: jsonb('citations').$type<Record<string, unknown>[]>(),
    model: text('model'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('property_chat_messages_property_id_idx').on(table.property_id, table.created_at)]
);

export type PropertyCheck = typeof propertyChecks.$inferSelect;
export type PropertyChatMessage = typeof propertyChatMessages.$inferSelect;

export interface TokenManifestDoc {
  slot: string;
  filename: string;
  size: number;
  sha256: string; // 0x-prefixed sha256 of the stored file
  leaf: string; // keccak256(sha256), the Merkle leaf
}

/** One blockchain property token per approved property. Hashes only on-chain; this row is the off-chain mirror. */
export const propertyTokens = pgTable(
  'property_tokens',
  {
    id: text('id').primaryKey(), // tok_<uuid>
    property_id: text('property_id')
      .notNull()
      .unique()
      .references(() => properties.id, { onDelete: 'cascade' }),
    token_id: text('token_id').notNull().unique(), // uint256 as decimal; == propertyId on-chain
    property_key: text('property_key').notNull(), // 0x… keccak256(abi.encode(jurisdiction, parcel))
    jurisdiction: text('jurisdiction').notNull(),
    parcel: text('parcel').notNull(),
    owner_ref: text('owner_ref').notNull(),
    doc_root: text('doc_root').notNull(),
    doc_count: integer('doc_count').notNull(),
    manifest: jsonb('manifest').$type<TokenManifestDoc[]>().notNull(),
    proofs: jsonb('proofs').$type<Record<string, string[]>>().notNull(),
    metadata_hash: text('metadata_hash').notNull(),
    metadata_gcs_path: text('metadata_gcs_path').notNull(),
    attestation: text('attestation').notNull(),
    approved_by: text('approved_by').notNull(),
    approved_at: timestamp('approved_at', { withTimezone: true }).notNull(),
    network: text('network').notNull(),
    chain_id: integer('chain_id').notNull(),
    contract_address: text('contract_address').notNull(),
    version: integer('version').notNull().default(1),
    status: text('status').notNull().default('pending'), // pending | confirmed | failed
    tx_hash: text('tx_hash'),
    block_number: integer('block_number'),
    error: text('error'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('property_tokens_doc_root_idx').on(table.doc_root)]
);

/** Chain of title: every register / update transaction for a token. */
export const propertyTokenTxs = pgTable(
  'property_token_txs',
  {
    id: serial('id').primaryKey(),
    token_id: text('token_id')
      .notNull()
      .references(() => propertyTokens.token_id, { onDelete: 'cascade' }),
    kind: text('kind').notNull(), // register | update
    version: integer('version').notNull(),
    doc_root: text('doc_root').notNull(),
    tx_hash: text('tx_hash').notNull(),
    block_number: integer('block_number').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('property_token_txs_token_idx').on(table.token_id)]
);

// Relations
export const propertiesRelations = relations(properties, ({ many }) => ({
  documents: many(propertyDocuments),
}));

export const propertyDocumentsRelations = relations(propertyDocuments, ({ one }) => ({
  property: one(properties, {
    fields: [propertyDocuments.property_id],
    references: [properties.id],
  }),
}));

export const societiesRelations = relations(societies, ({ many }) => ({
  unitTypes: many(unitTypes),
  listings: many(listings),
  bhkPrices: many(bhkPrices),
  reviews: many(reviews),
}));

export const unitTypesRelations = relations(unitTypes, ({ one }) => ({
  society: one(societies, {
    fields: [unitTypes.society_id],
    references: [societies.id],
  }),
}));

export const listingsRelations = relations(listings, ({ one }) => ({
  society: one(societies, {
    fields: [listings.society_id],
    references: [societies.id],
  }),
}));

export const bhkPricesRelations = relations(bhkPrices, ({ one }) => ({
  society: one(societies, {
    fields: [bhkPrices.society_id],
    references: [societies.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  society: one(societies, {
    fields: [reviews.society_id],
    references: [societies.id],
  }),
}));

// Types
export type Society = typeof societies.$inferSelect;
export type NewSociety = typeof societies.$inferInsert;
export type UnitType = typeof unitTypes.$inferSelect;
export type NewUnitType = typeof unitTypes.$inferInsert;
export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
export type BhkPrice = typeof bhkPrices.$inferSelect;
export type NewBhkPrice = typeof bhkPrices.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type Poi = typeof pois.$inferSelect;
export type NewPoi = typeof pois.$inferInsert;
export type ScrapeRun = typeof scrapeRuns.$inferSelect;
export type NewScrapeRun = typeof scrapeRuns.$inferInsert;
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type PropertyToken = typeof propertyTokens.$inferSelect;
export type PropertyTokenTx = typeof propertyTokenTxs.$inferSelect;
export type PropertyDocument = typeof propertyDocuments.$inferSelect;
export type NewPropertyDocument = typeof propertyDocuments.$inferInsert;
