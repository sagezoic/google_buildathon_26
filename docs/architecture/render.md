# Rendering the Realdha architecture diagram

`realdha-architecture.mmd` is a Mermaid `architecture-beta` diagram. It uses a custom icon pack
(`rd:*` icons in `realdha-icons.json`: colored tiles built from Font Awesome Free glyphs, CC BY 4.0).

Serve the icon pack with CORS, then render:

    mmdc -i realdha-architecture.mmd -o realdha-architecture.svg -b white \
         --iconPacksNamesAndUrls "rd#http://127.0.0.1:8765/icons.json"

To use the official Google Cloud icons, register them as another Iconify pack and swap the `rd:` names.

## Label readability (postprocess.js)
Mermaid draws edges behind node labels with transparent backgrounds, so arrows cross label text.
`postprocess.js` (Playwright) puts a white box behind each label and redraws arrowheads on top:

    mmdc -i realdha-architecture.mmd -o base.svg -b white --iconPacksNamesAndUrls "rd#http://127.0.0.1:8765/icons.json"
    node postprocess.js base.svg realdha-architecture.svg realdha-architecture.png

## Vertical gap compaction
After mmdc, run: python3 compact.py base.svg base_c.svg 380 (closes the gap between the top row and the rest), then node postprocess.js base_c.svg out.svg out.png

Text sizing: service labels 24px, group titles 20px (CSS injected before postprocess.js); users/payments/AI group boxes extended 22 units for two-line labels.

Update: iconSize 96, idealEdgeLengthMultiplier 2.5, nodeSeparation 140; compact.py delta 360; label CSS 22px/18px, no group extension needed.

Tighter: idealEdgeLengthMultiplier 2.3. finish.sh automates compaction (gap reduced to ~110 units), 22px/18px label CSS, postprocess and 16:9 export: finish.sh base.svg tag

Chain Worker arrow shortened: compactx.py shifts worker and Ethereum left (gap 150 units) after the vertical compaction.

build.py usage: python3 build.py <base-name> 26 20 0.86  (label px, group-title px, vertical row scale); needs vscale.py, compact.py, compactx.py, postprocess.js (/tmp/gen/fix.js).
