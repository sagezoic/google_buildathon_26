# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: property owners in Maharashtra (the golden path, GP-01 to GP-23).** A retail owner signs up with phone OTP and PAN/DigiLocker KYC, adds a plot or apartment, and uploads its title documents (7/12 extract, sale deed, mutation entries, often in Marathi). They read an AI verification report, resolve flagged items, get a lawyer to sign off, approve on-chain anchoring, and end up with a permanent digital twin of the property that they can share, check against and, where allowed, tokenise through a fund partner.
- **Secondary roles in the same product:** buyers doing due diligence (search, reports, share links, enquiries, calls); builders and developers (projects, towers, unit inventory, publishing, dashboards); channel partners; lawyers and valuers (review queue, sign-off); fund partners; platform admins; government viewers (record lookup, fingerprint check, audit).

## Product Purpose

Realdha gives every property in India one permanent, verified record. AI reads and cross-checks the documents, a lawyer signs off, and document fingerprints are anchored on a blockchain, so any later change can be detected. A 3D digital twin is linked to the verified record. Success means an owner gets from a pile of paper documents to a signed-off, anchored record they trust and can share.

## Positioning

The infrastructure layer for real estate, not a listing portal, brokerage, CRM, 3D agency or crypto product. Verification comes first and the blockchain shows up only as proof. Tokenisation goes only through licensed partners (SEBI-registered AIF or SM-REIT), and Realdha never holds investor money or issues tokens to the public.

## Operating Context

- Documents are Indian land and title records: 7/12 extracts, sale deeds, mutation entries, NOCs, RERA registrations. They are often in Marathi or Hindi.
- Record IDs follow the pattern `RA-<CITY>-<NNN>-<TOWER>-<FLOOR>-<UNIT>` (for example `RA-PUN-001-A-18-04`).
- Verdicts are Stop, Clarify and Proceed. Findings carry severity (High, Medium, Low), a source quote and a page reference.
- Anchoring runs on the Sepolia testnet.
- The UI runs in English, Hindi and Marathi.

## Capabilities and Constraints

- Every screen shows two labels that cannot be dismissed: "DEMO · TESTNET · NOT AN OFFER" and "Sample data".
- AI answers cite the document and page, say plainly when an answer is not in the documents, and carry "Not legal advice".
- Market prices are shown as indicative only.
- Mint amounts (unit price, supply) are set by the owner. A failed mint needs the owner to approve again.
- The screen designs live in the Realdha UI frames artifact (desktop 1440, tablet 834, mobile 390).
- Undecided (from the artifact's open questions): the fund partner's name (placeholder), the lawyer and valuer nav items, how much Hindi and Marathi copy gets translated (only X-05 so far), and where the golden path hands off into the F flows.

## Brand Commitments

- Name: Realdha. Line: "One permanent record for every property in India."
- Calm, factual, official voice. Sentence-case labels. No hype and no crypto language.

## Evidence on Hand

- Strategy and application documents in `references/` (REALDHA.docx, the competition application, the build plan).
- A scraped Pune and Gurgaon project dataset in `references/flat-finder/data/properties.db`.
- No real customers, testimonials, partners or verified records yet. Everything in the UI is sample data and must say so.

## Product Principles

1. Proof over promise: every claim of verification points to a document, page or fingerprint.
2. The record is the product. 3D, AI and tokens serve the record and never replace it.
3. Never overstate legal status: demo, testnet and sample are always visible, and AI output is not legal advice.
4. Built for regional-language documents. Marathi and Hindi are first-class.

## Accessibility & Inclusion

- WCAG 2.2 AA: text contrast of 4.5:1 or better on its own background, and status is never shown by colour alone (always icon plus word).
- 44px minimum touch targets and a visible focus ring on every interactive element.
- Devanagari gets taller line heights so matras and conjuncts never clip.
