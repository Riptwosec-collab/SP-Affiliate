# Emerald lighting — design QA, v2.6.1

final result: passed

## Target and comparison

Reference: supplied `upload/image(6).png`, 1672 × 941. Compared with the same-size empty-workspace capture `test-results/emerald-reference-viewport.png`. Also inspected `storefront-mobile.png` and the rendered cloud-browser preview.

## Changes and resolved findings

- Matched cyan edge highlights on active navigation, language, category and content filters. Added separate inset highlights, contact shadows and outward glow rather than a single uniform shadow.
- Deeper emerald surfaces and layered glass controls, warmer border accents, white heading highlights, violet/gold/mint quick-tool icons and stronger hero CTA lighting.
- Existing embedded artwork retained. Hero raster edges feather into its surface; the image's opaque rectangle is not given a drop shadow. Empty-library artwork has a separate contact shadow.
- Desktop hero ends at approximately y390 (reference y389); categories start around y435 (reference y434); library begins around y547 (reference y546). Existing header, sidebar and productivity-column anchors retained.
- Flat-surface preference removes panel gradients, shadows and icon filters. Verified through the live appearance control; hero computed background-image and box-shadow both become `none`.
- No decorative global images or animated lighting. Mobile layout and reduced-motion behavior retained.

No unresolved P0/P1/P2 issue in the functional production adaptation.

## Intentional differences and remaining fidelity limits

Not pixel-identical. Existing brand, Tabler icon shapes, generated illustrations, font rendering, text and dynamic content differ from the source. The real empty workspace shows 0/0 tasks and missing metrics, rather than the fictional tasks, chart and revenue in the mockup. Unsupported PRO, notifications, profile and provider claims are not added. Shopee/AI remain disconnected until configured and verified. No authored content, saved data, category support or application logic changed.

## Verification

- Storefront: 14 checks passed, including TH/EN, reload, filters, keyboard navigation and 8-route responsive matrix at 320, 390, 768, 1024, 1440, 1680 and 1920px.
- Upgrade: 15 checks passed, including legacy database/JSON, draft recovery, Story autosave, Undo/Redo, revisions, import/merge and offline standalone HTML.
- Cloud browser: appearance control, TH/EN, invalid-link validation and refresh inspected. Console errors were extension metadata messages; no app page errors in regression runs.
- Build embeds the new `src/lighting.css` module in the single HTML file. No dependencies, data migrations or hosting settings changed.
- Physical Safari/iPhone not tested. No external provider connection was made.
