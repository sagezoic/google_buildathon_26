# REALDHA UI: Initial View & Core User Flow Specification

## 1. Overview & Objective

The initial view of `realdha-ui` brings together the two foundational pillars of REALDHA for the Google Buildathon demo:
1. **REALDHA Verify (The Trust & Verification Engine):** Automated AI analysis of Maharashtra property documents (7/12 extracts, Index II, MahaRERA registrations, sale deeds) with discrepancy flagging, Marathi-to-English translation, and cryptographic hash verification.
2. **REALDHA Explore (The Digital Property Record):** The persistent digital passport for an individual unit (`RA-PUN-001-A-18-04`), featuring spatial twin visualization, orientation, floor plate location, and an interactive Gemini Property Assistant.

---

## 2. Information Architecture & Layout (The Unified Digital Property Passport)

The initial view is organized as an institutional-grade, high-density dashboard structured into 4 synchronized regions:

```
+--------------------------------------------------------------------------------------------------+
|  [REALDHA LOGO]   Search ID: [ RA-PUN-001-A-18-04      ▼ ]    [ Upload & Verify Doc ]   [ Share ]|
+--------------------------------------------------------------------------------------------------+
|  PROPERTY IDENTITY BANNER                                                                        |
|  Unit A-1804 · 3 BHK (1,180 sq ft) · Tower A, 18th Floor · Amanora Park Town, Hadapsar, Pune     |
|  REALDHA ID: RA-PUN-001-A-18-04  |  MahaRERA: P52100018892  |  Status: Verified  |  ₹1.65 Cr     |
+------------------------------------------------+-------------------------------------------------+
|  LEFT PANEL: THE SPATIAL TWIN & SPECS          |  RIGHT PANEL: REALDHA VERIFY & AUDIT DOSSIER    |
|                                                |                                                 |
|  [Tab: 3D Twin] [Tab: Balcony View] [Floor]   |  [VERIFICATION SUMMARY SCORE: 98/100 · CLEAR]   |
|  +------------------------------------------+  |  ✓ 30-Year Chain of Title: Unbroken (1996-2026) |
|  |                                          |  |  ✓ MahaRERA Sanctioned Plan: Matches 1,180 sqft|
|  |  Interactive 3D Digital Twin / Viewport  |  |  ✓ Encumbrance Check: Clear (Bank NOC on file) |
|  |  (Unit walk-through, East-facing light,   |  |  ⚠ 1 Note: Marathi Ferfar #4120 heir release  |
|  |   balcony view simulation, floor plan)   |  |                                                 |
|  +------------------------------------------+  |  FINGERPRINT ON ETHEREUM (Cloud KMS anchored)   |
|  Orientation: East | Floor Height: 54m         |  Tx: 0x7f9a...3b21 | SHA-256: e3b0c44298fc...   |
|  Carpet: 1,180 sq ft | Built-up: 1,420 sq ft   |                                                 |
|  Balcony: Unobstructed Hill View               |  DOCUMENT CHAIN DOSSIER (Click to inspect):     |
|                                                |  1. MahaRERA Registration Certificate [PDF]     |
|  PRESET SHOWCASE SCENARIOS:                    |  2. Index II Registered Agreement (2021) [PDF]  |
|  [1. Pune High-Rise A-1804 (Clean)]            |  3. Marathi 7/12 Extract (Gat #84) [Translated] |
|  [2. Lonavala NA Plot (Area Mismatch Flag)]    |  4. Commencement Certificate (PMC) [Verified]   |
|  [3. Resale Flat (Missing Heir Flag)]          |                                                 |
|  [4. Bhiwandi Warehouse (Mortgage Flag)]       |                                                 |
+------------------------------------------------+-------------------------------------------------+
|  BOTTOM PANEL: GEMINI PROPERTY ASSISTANT (Ground-Truth Q&A & Document Inspector)                |
|  Ask questions: "What is the exact carpet area in the sanctioned plan?", "Is there any loan?",   |
|  "Translate the Marathi Ferfar note on inheritance", "What is directly above floor 18?"        |
|  [Chat Input: Ask Gemini anything about RA-PUN-001-A-18-04...]                   [Ask AI]        |
+--------------------------------------------------------------------------------------------------+
```

---

## 3. Step-by-Step User Flow

### Flow 1: Exploring the Verified Property Record (Buyer / NRI Journey)
1. **Entry:** User arrives at the app. The default showcase unit `RA-PUN-001-A-18-04` (Pune Amanora Tower A) loads instantly.
2. **Inspect Identity & Truth:** User reviews the persistent REALDHA ID, MahaRERA registration number, physical attributes (1,180 sq ft carpet, East-facing, 18th floor).
3. **Spatial Exploration:** User toggles between:
   - **3D Floor Plan / Spatial Twin:** Exploring room layouts, room dimensions, and finishes.
   - **Balcony View & Light Simulation:** Seeing morning vs afternoon sun and unobstructed hill view.
   - **Stack & Floorplate Context:** Identifying units directly above (A-1904) and below (A-1704).
4. **Inspect Legal Verification:** User reviews the **REALDHA Verify Audit Card**:
   - Sees green checkmarks for MahaRERA approvals, 30-year Index II registration, and Title Search.
   - Clicks any document in the dossier to see the source document, extracted fields, and blockchain hash.
5. **Ask Gemini Property Assistant:** User types questions like:
   - *"Does this unit have any unreleased bank mortgage?"*
   - *"What does the Marathi 7/12 extract say about land tenure?"*
   - Gemini answers with exact source quotes and page citations from the verified documents.

### Flow 2: Live Document Upload & AI Verification (Seller / Lawyer / Banker Journey)
1. **Trigger:** User clicks **"Upload & Verify Document"** button in header.
2. **Document Ingestion:** User drags and drops a property document (e.g., a Marathi 7/12 extract PDF, an Index II deed, or a MahaRERA approval).
3. **Gemini Extraction & Analysis:**
   - Document AI / Gemini OCR extracts text, identifying party names, CTS/Gat survey numbers, carpet area, transaction dates, and encumbrances.
   - Cross-checks extracted data against existing project records.
4. **Discrepancy Detection & Alerting:**
   - If an anomaly exists (e.g. area mismatch: claimed 465 sq m vs record 418 sq m, or missing mutation entry), the system displays a prominent warning badge: **"Attention Needed: Discrepancy Flagged"**.
   - Displays side-by-side comparison with the exact source clause highlighted.
5. **Tamper-Evident Anchoring:** Generates SHA-256 fingerprint ready for blockchain anchoring via Cloud KMS.

### Flow 3: Switching Between Real-World Test Scenarios (Judge / Evaluator Journey)
For the Google Buildathon evaluation, judges can click quick-switch scenario tabs to test the 4 real-world cases documented in the founder papers:
1. **Scenario 1 (Pune High-Rise - Clear Record):** Unit A-1804 with complete MahaRERA, sanctioned plans, and clean title.
2. **Scenario 2 (Lonavala NA Plot - Area Mismatch):** Anita's plot where seller draft claims 465 sq m vs 418 sq m on Marathi 7/12. Gemini flags: *"Stop & Clarify"*.
3. **Scenario 3 (Pune Resale Flat - Inheritance Defect):** Sameer's flat where society share certificate and heirship papers reveal one legal heir has not signed release.
4. **Scenario 4 (Bhiwandi Leased Warehouse - Hidden Charge):** Leased warehouse with active rent yield, but an unreleased 2019 bank mortgage flagged before deal closing.

---

## 4. Key UI Components & Interactions (shadcn/ui Architecture)

- `PropertyHeader`: Displays REALDHA ID badge, MahaRERA verification pill, project location, pricing, and action triggers.
- `SpatialTwinViewer`: Interactive canvas/viewport with controls for floor selection, lighting simulation (morning/evening), and view perspectives.
- `VerificationAuditCard`: Displays trust score, verified document checklist, anomaly alerts, and Ethereum ledger anchoring status.
- `DocumentDossierDrawer`: Collapsible sheet / drawer showing full documents, OCR highlights, and Marathi-to-English translations.
- `GeminiAssistantPanel`: Conversational agent grounded in Vertex AI with suggested prompt chips and markdown-formatted citations.
- `UploadVerificationDialog`: Modal for uploading new deeds/extracts with real-time extraction progress and instant verdict.
- `ScenarioSwitcher`: Top-level segmented control allowing evaluators to switch between the 4 reference case studies seamlessly.
