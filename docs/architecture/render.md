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
