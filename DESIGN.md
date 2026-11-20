# Design

Source of truth: the **Realdha UI frames** artifact (style board "Main", component sheets C1–C3, and the 123 screen frames at 1440 / 834 / 390). Light mode is copied from it exactly. Dark mode (Graphite) is not drawn there; it was derived under the same rules and chosen on 2026-11-21.

Tokens live in `realdha-ui/src/styles/tokens.css` and reach Tailwind through `@theme inline` in `realdha-ui/src/index.css`. Run `node realdha-ui/scripts/check-contrast.mjs` after any colour change. A live specimen is at `/specimen.html?theme=light` and `?theme=dark`.

## Direction

**A land registry made modern.** Deep registry blue on cool, quiet greys; white cards with hairline borders instead of shadows. Nothing glows, nothing has a gradient. The blockchain appears only as proof.

Three things every screen keeps:

1. **Registry blue carries action and identity.** Primary buttons, links, the wordmark and the active nav item.
2. **Seal teal means "anchored" and nothing else.** It is used only for on-chain facts: fingerprints, hashes, the network name, the Anchored pill and the proof panel.
3. **Status is never colour alone.** Every pill, verdict and error pairs an icon, a word and a colour. Stop, Clarify and Proceed also differ in icon shape (cross in a circle, triangle, check in a circle).

Every screen carries two labels that cannot be dismissed: the **DEMO · TESTNET · NOT AN OFFER** bar and a **Sample data** pill.

### Never

- Gradients, glow, glass or blur as decoration.
- Teal on anything that is not an on-chain fact.
- Status shown by colour alone.
- Colours outside the tokens. Tailwind's default palette is cleared on purpose, so `bg-blue-500` doesn't exist.
- Shadows on resting cards beyond E1. Depth comes from borders.
- Title Case labels. Labels are sentence case.

## Colour

The colour roles are listed below; components use them, never raw hex values. Light values come from the artifact.

| Role | Tailwind | Light | Dark (Graphite) | Use |
|---|---|---|---|---|
| Canvas | `bg-canvas` | #F5F6F8 | #111316 | Page background |
| Surface | `bg-surface` | #FFFFFF | #1A1D21 | Cards, nav, tables, modals |
| Sunken | `bg-sunken` | #F5F6F8 | #15171A | Table header, ID chip, disabled field |
| Field | `bg-field` | #FFFFFF | #15171A | Input background |
| Line | `border-line` | #D8DDE4 | #2C3036 | Card borders, dividers |
| Line strong | `border-line-strong` | #B9C1CC | #646B75 | Input and secondary-button borders |
| Line hover | `border-line-hover` | #4F5B6B | #8F96A0 | Field hover border |
| Text | `text-text` | #172033 | #E9EBEE | Body and headings |
| Muted | `text-muted` | #4F5B6B | #A3A9B2 | Secondary text, labels, placeholders |
| Disabled | `text-disabled` | #6B7685 | #858C96 | Disabled control text |
| Brand | `text-brand` | #1B3A6B | #9DBDF0 | Wordmark |
| Primary | `bg-primary` | #1B3A6B | #2F64B8 | Primary button fill |
| Primary hover | `bg-primary-hover` | #0F2447 | #2A5AA6 | Primary button hover |
| Primary text | `text-primary-text` | #1B3A6B | #8DB4F0 | Links, secondary/ghost button text, active nav |
| On primary | `text-on-primary` | #FFFFFF | #FFFFFF | Text on a primary fill |
| Primary tint | `bg-primary-tint` | #E8EDF5 | #1E2A3D | Selected rows, hover fills, avatar |
| Focus | `outline-focus` | #2F6FB0 | #7FB1EE | Focus ring |

Dark mode splits **Primary** (the fill) from **Primary text** because no single blue passes 4.5:1 both under white text and on graphite. In light mode they are the same value.

**Status and on-chain.** Each has a solid colour (borders, icons, filled buttons), a tint (pill and banner fills) and an ink colour (text on the tint).

| Role | Solid · tint · ink, light | Solid · tint · ink, dark |
|---|---|---|
| Success | #1E7A4B · #E4F3EA · #14573A | #4CC08A · #142A1F · #92DDB5 |
| Warning | #8A5700 · #FFF1CF · #5C3A00 | #E0A93B · #2D240F · #F3CD7C |
| Danger | #B42318 · #FDE9E7 · #8A1B12 | #F07167 · #361816 · #FFB4AB |
| Info | #1F5F9E · #E3EEFA · #174B80 | #6EA6E6 · #172638 · #A9CBF2 |
| On-chain | #0F6D66 · #DDF1EE · #0B524C | #46BDB1 · #12292A · #86D9CF |
| Demo label | #8A5700 line · #FFF1CF fill · #5C3A00 text | #E0A93B · #2D240F · #F3CD7C |

Text on a solid status fill uses `text-on-status`: white in light mode, graphite in dark mode.

**Contrast.** Every text role passes 4.5:1, and focus, status solids and dark input borders pass 3:1 (see `check-contrast.mjs`). One known exception is pinned by the artifact: the light input border #B9C1CC on white is 1.82:1, below the WCAG 1.4.11 guideline. It is kept to match the artifact, and the field's label, placeholder and focus ring carry the affordance.

**Theme switching.** Set `data-theme="dark"` on `<html>`. The app shell (Phase 1) sets it from the user's setting, falling back to `prefers-color-scheme`. Tailwind's `dark:` variant follows the same attribute.

## Type

IBM Plex Sans (Latin) with Noto Sans Devanagari (Hindi, Marathi), and IBM Plex Mono for record IDs, hashes and fingerprints only. All three are self-hosted through `@fontsource`.

| Token | Size / line height | Weight | Use |
|---|---|---|---|
| `text-display` | 36/44, −0.02em | 600 | Verdict and record hero headings |
| `text-h1` | 28/36, −0.01em | 600 | Page titles |
| `text-h2` | 22/30 | 600 | Section titles, card titles |
| `text-h3` | 18/26 | 600 | Sub-sections |
| `text-body` | 16/24 | 400 | Body |
| `text-control` | 15/20 | 500 | Buttons and inputs |
| `text-small` | 14/20 | 400 | Table cells, meta lines |
| `text-chip` | 13/20 | 500 | Record ID chip, verdict chips, tabs |
| `text-label` | 12/16 | 500 | Field labels, pills, help and error text |
| `text-overline` | 11/16, uppercase, +0.05em | 600 | Nav role labels only |
| `font-mono` | 14/20 | 500 | `RA-PUN-001-A-18-04`, `0x9f3a…c21e` |

**Devanagari** runs at the same size as Latin but with a line height of about 1.7, so matras and conjuncts never clip. The `:lang(hi)` and `:lang(mr)` rules do this automatically, so every Devanagari string needs a `lang` attribute. Buttons and pills get 4px of extra height in हिं and मरा.

Tabular numerals are on for tables and for anything marked `.tabular`.

## Space, shape, depth

- **Spacing:** an 8pt grid with steps of 4, 8, 16, 24, 32, 48, 64. Page gutter is 24, or 16 below 834 (`px-gutter`). Card padding is 24. Form fields are 16 apart.
- **Breakpoints:** mobile 390, tablet 834 (`md:`) and desktop 1440 (`xl:`). Every screen is one responsive route matching all three frames.
- **Radius:** 6 for controls (`rounded-control`), 12 for cards (`rounded-card`), 16 for modals (`rounded-modal`), and pill (`rounded-pill`).
- **Elevation:**
  - E0: border only.
  - E1: card, `0 1px 2px` at 8%.
  - E2: menus and popovers, `0 4px 12px` at 12%.
  - E3: modals and drawers, `0 12px 32px` at 18%.
  - Dark mode deepens the shadow alpha. The scrim is ink at 45%.
- **Sizes:** controls are 44px high (36px in table rows). The minimum tap target is 44px.

## Focus and motion

- **Focus:** a single ring on every interactive element: 3px solid `--rd-focus` with a 2px offset. Fields use a border-colour change plus a 3px halo (`--rd-focus-halo`) instead.
- **Motion:** short and functional. 120ms for hover and press, 200ms for menus, toasts and drawers, 320ms for modals and page-level reveals, all on `--rd-ease-out`. Nothing loops except the loading spinner and the processing steps. `prefers-reduced-motion` removes it all.

## Components (from C1–C3)

Phase 2 builds these on shadcn/ui, themed only through the tokens above.

- **Button:**
  - Variants: primary, secondary (surface fill, strong border, primary-text label), ghost and danger.
  - States: hover, focus ring, disabled (disabled fill, disabled line, disabled text) and loading (spinner plus a verb ending in "…", such as "Checking…").
  - 44px high (36px small), radius 6, sentence-case label.
- **Field:**
  - A label above (14/500), help text below (12, muted).
  - Error: danger border plus a 1px inset, an icon, and a message in danger ink.
  - States: hover (line hover), focus (border plus halo), disabled (sunken fill).
- **OTP input:** 48×56 cells, 22/600.
- **Uploader:** a dropzone, then file rows showing status, detected language and page count.
- **Record ID chip:** sunken fill, line border, mono 13, with a 24px copy button.
- **Status pill:** pill radius, 12/500, a 14px icon, tint fill and ink text.
- **Verdict:**
  - Chip: radius 6, solid border, tint fill.
  - Banner: card radius, solid border, tint fill, icon plus word plus one sentence.
- **Finding card:** severity pill, extracted value, the conflicting value, a bilingual source quote (मराठी / EN) with document and page, and Correct / Confirm actions.
- **Proof panel:** Anchored pill, then rows (fingerprint, transaction hash, network, time) with chain-ink values, plus the line "Only the fingerprint is public. The document stays private."
- **AI answer:** the question, an answer with citation chips (`Mutation 2291 · p1`), "AI-generated from the verified documents. Not legal advice." and a not-found state that says what to upload instead.
- **Data table:** a search field, filter chips, a sunken header row (12/600 muted) and 14px cells with line dividers. Row hover uses the primary tint. Pagination reads "Showing 1 to 4 of 27".
- **Shell:**
  - Demo bar on top, then a 56px nav: wordmark, role items with a 3px active underline, the EN/हिं/मरा switcher, and a 32px avatar.
  - Role labels use `text-overline`.
  - Below 834 the nav collapses as the `M-` frames show.
- **Overlays and states:**
  - Modal: radius 16, E3, focus trapped. Esc closes it unless a destructive action is pending.
  - Drawer: E3.
  - Toast.
  - Empty states: a sentence and a next action.
  - Skeletons: `bg-skeleton`, radius 4.
