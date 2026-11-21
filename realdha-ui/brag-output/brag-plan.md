# Realdha: brag plan

**What it is:** One permanent record for every property in India. AI reads the title documents (including Marathi 7/12 extracts), flags what doesn't match, a lawyer signs off, and document fingerprints are anchored on-chain.
**Who it's for:** Property owners and buyers in Maharashtra who can't easily read or cross-check land paperwork.
**What sets it apart:** It reads the original Marathi records and cites them next to an English translation.
**Most impressive claim:** It catches a 47 sq m (11%) gap between the 7/12 extract (418 sq m) and the seller's draft agreement (465 sq m).
**Visual hook:** Two documents disagree about the size of the same plot.
**Tone:** `default`, kept quiet to suit the app's "Satbara ledger" look: warm paper, ink, stamp indigo, vermilion seal, chain teal.
**Share caption:** "The 7/12 says 418 sq m. The draft says 465. Realdha reads the Marathi and flags the gap before you pay."

## Identity
- Canvas `#F4EFE4`, surface `#FBF9F3`, ink `#1B1A17`, stamp indigo `#23306B`, seal red `#B3261E`, chain teal `#0F6B6B`, hairlines `#DDD5C3`.
- Source Serif 4 (headings), Hanken Grotesk (UI), IBM Plex Mono (hashes), Noto Sans Devanagari.
- Real UI: cards captured at 3× from the running app (`/properties/new/upload`, `/report`, `/anchoring`, where the anchor flow was clicked through live). Demo personas only (Gat 112/2, Kusgaon fixture). No audit-trail names are shown.

## Timing
120 BPM, so 1 beat = 0.5s = 15 frames. 21s = 42 beats = 630 frames at 30fps. Every cut is on a beat.

| # | Time | Beats | Scene |
|---|---|---|---|
| 1 Hook | 0–4s | 0–8 | The Devanagari line `एकूण क्षेत्र: ०.०४१८ हे.आर` writes in. "The land record says **418 sq m**." Then "The sale draft says **465**," stamped in seal red. |
| 2 Reveal | 4–7s | 8–14 | The logo drops in, then "Realdha" and "One permanent record for every property in India." |
| 3 Reads Marathi | 7–11s | 14–22 | "Reads Marathi 7/12 extracts." The real upload list fills row by row, and a scan sweeps the `Detected: मराठी` badges. |
| 4 Flags it | 11–15s | 22–30 | "Flags the 47 sq m before you pay." The real Clarify banner, then the real "Area differs" finding, with a seal ring on 47 sq m (11%). |
| 5 On-chain | 15–18s | 30–36 | "A lawyer signs off. Fingerprints go on-chain." The real approve card, a cursor clicks Approve and anchor, and the card turns into "Anchored on-chain". |
| 6 Outro | 18–21s | 36–42 | The logo, "Realdha", and "Check a title before you pay." |

## Sound
D major, 120 BPM. Soft kick on each beat from bar 2, quiet off-beat shaker, round bass, marimba-like plucks. The effects are notes in the key: plucked ticks for each row, a low felt "stamp" on the 465 and on the finding, a teal chime arpeggio when it's anchored, and a resolving chord on the outro. Light reverb on everything.
