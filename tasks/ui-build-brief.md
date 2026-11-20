# Brief: building a Realdha screen from its frames

Working dir: `/Users/light/Documents/competitions/google_buildathon/realdha-ui`. Dev server is already running on :5173 (if not: `npm run dev -- --port 5173`).

## Source of truth
Frames for each screen, three sizes, in `../references/realdha-frames/project/`:
`GP-07-AddProperty.dc.html` (1440), `T-GP-07-AddProperty.dc.html` (834), `M-GP-07-AddProperty.dc.html` (390).
They are static HTML with inline styles. Read all three (strip `<svg>` blocks when printing to save tokens, e.g. a small python regex). `../references/realdha-frames/project/N-GP-Annotations.dc.html` has per-screen notes. `C1-Controls` and `C2-Content` are component specs.

## Rules (from tasks/todo.md)
- ONE responsive screen per frame ID, file `src/screens/<ID-Name>.tsx` (e.g. `GP-07-AddProperty.tsx`), default export. It is auto-registered (src/app/registry.ts) at `/gp-07`. The 1440/834/390 frames are the same component at three breakpoints (Tailwind `md:` = 834, `xl:` = 1440). Where mobile copy differs from desktop copy in the frames, render both with `md:hidden` / `max-md:hidden` spans like `src/screens/GP-01-Signup.tsx` does (the exemplar: read it first).
- Copy, order, labels and sample data are VERBATIM from the frames. No invented copy.
- Every state drawn inside a frame (OTP wrong/expired, KYC pending/failed, mint failed, etc.) must be a real UI state reachable via `?state=<name>` using `useDemoState` from `src/app/useDemoState.ts` (first entry is default). Where the frame shows variants side by side as annotation, build them as states.
- Wrap in `<Screen id="GP-07" layout="app"|"auth">` from `src/app/Shell.tsx` (it supplies DEMO bar, nav, tab bar). USER OVERRIDE: the text "DEMO · TESTNET · NOT AN OFFER" must NEVER appear anywhere (the Shell renders no prototype strip: no Prev/Next, no "Golden path n of N"; this is a real app). The `SampleData` label (components/ui/record-id.tsx) stays where frames put it. If a frame draws a DEMO banner, keep any other copy in it and drop that string.
- Prototype navigation: primary buttons/links go to the next screen in spec order or wherever the frame's `href` points. Frame hrefs like `GP-02-PhoneOTP.dc.html` map to route `/gp-02`; use `path('GP-02')` from `src/app/nav.ts`. Frames link to F-flow screens too (e.g. `/f03-03`); use those paths even if not built yet.
- Data: typed sample fixtures, no network. Put shared fixtures in `src/data/fixtures/<topic>.ts` (typed). Prakash's plot: Kusgaon Plot 112/2, record RA-LON-004-P-112-2; apartment A-1804 RA-PUN-001-A-18-04 - take exact values from the frames.
- Styling: Tailwind v4 utilities mapped to tokens (see `src/index.css` @theme: bg-surface, bg-canvas, text-muted, border-line, text-brand, bg-primary-tint, text-success-ink, bg-warning-tint, bg-chain-tint/text-chain-ink for on-chain ONLY, rounded-card, shadow-e1, text-h1/h2/h3/small/label, h-control etc.). NEVER hardcode hex colours, no gradients, no glow, no inline style objects. Both light and dark must work (tokens handle it; check `?theme=dark`). Status is never colour alone: icon + word + colour (`Pill`). Use lucide-react icons.
- Existing primitives in `src/components/ui/`: Button (to=, variants primary/secondary/ghost/danger, sizes sm/md/lg, loading), Pill (tone + icon), Card, RecordId, SampleData, Field. DO NOT edit these existing files or `src/app/*` shared files (other agents work in parallel). If you need a new shared component (Modal, Drawer, OtpInput, Stepper, FindingCard, VerdictBanner, Uploader …), create it as a NEW file in `src/components/ui/` (check first whether another agent already created it: `ls src/components/ui`; if so reuse it unchanged). Modals/drawers: use `@radix-ui/react-dialog` (installed): focus trap, Esc closes, scrim 45%, modal radius 16 shadow-e3, drawer 360 wide (480 for the AI drawer) from the right. Only if nav items for a role are wrong, tell me in your report instead of editing nav.ts.
- Accessibility: labelled inputs, keyboard + visible focus (global ring exists), 44px tap targets at 390, aria-live for async states, Devanagari text needs no clipping.

## Verify (required before you report)
1. `npx tsc -b` and `npm run lint` must pass for your files (other agents' in-flight errors are not yours).
2. Reference render: `node scripts/frame-shot.mjs GP-07-AddProperty T-GP-07-AddProperty M-GP-07-AddProperty` -> `.impeccable/review/frames/*.png`.
3. Your render: `node scripts/shot.mjs gp-07 --sizes 1440,834,390 [--state name]` -> `.impeccable/review/screens/*.png`; also `--themes dark` once. Read the PNGs side by side with the frame PNGs and fix differences in layout, spacing, copy, hierarchy. Check each state too. Iterate until they match closely (the frames are the spec; frames' own navbar/tab bar is provided by Screen).
4. Do not run `npm run build` concurrently with others unless needed at the end; tsc is enough.

## Report (concise)
Per screen: file, states and their `?state=` names, any deviation from the frame and why, new shared components created, anything noticed that's wrong in the shared shell. No git commits.

## Working components and persistent fields (USER REQUIREMENT)
Every implemented control must really work and its value must persist across navigation and reload:
- Use `usePersistentState(key, initial)` from `src/app/persist.ts` for every input value, selection, checkbox, toggle, tab, decision (accept/reject/confirm), uploaded-file list (store name/size/status only, never File objects), chosen role/account type, GPS pin, etc. Use shared dotted keys so data flows between screens: `identity.phone`, `identity.pan`, `identity.accountType`, `property.draft` (the plot being added), `property.documents`, `property.findings`, `lawyer.decisions`, `anchor.status`, `mint.status`, and so on. A later screen must show what an earlier one collected (e.g. GP-06 greets with the saved name; GP-10/GP-11 show the saved plot).
- `?state=` still forces a drawn state for review; when no `?state` is given a screen may start from persisted progress.
- Buttons must do something real in the demo: validate (inline errors with icon+text, aria-invalid), enable/disable, move to the next route, show loading then result, copy to clipboard, toggle filters/sort, search, paginate, open/close modals and drawers. No dead buttons or links; if a target screen isn't built yet the route still exists.
- Keyboard works on all of it.
