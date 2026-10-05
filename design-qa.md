# Soft Glass Commerce — design QA

final result: passed

## Visual target and evidence

- Source: `/workspace/scratch/fd62f9c600ee/upload/image(4).png`, 1536 × 1024, with the accompanying `Pasted text(1).txt` brief.
- Matched desktop capture: `test-results/soft-glass-reference-viewport.png`, 1536 × 1024 CSS pixels, device scale factor 1. Source and implementation were opened together in the same comparison input at native dimensions.
- Additional captures: `test-results/storefront-desktop.png` (empty workspace), `test-results/storefront-products.png` (populated legacy workspace), `test-results/storefront-mobile.png` (390px empty workspace).
- Cloud-browser inspection: local preview `http://terminal.local:4173/#today`, browser tab 2, viewport 1363 × 936; screenshots, navigation, search for USB, and ascending-price selection inspected directly. Browser screenshot transfer did not materialize in the shared directory; the reproducible repository test captures above provide the saved visual evidence.
- Content state differs intentionally: the source contains five invented marketplace products, discounts, revenue, and a PRO plan. The implementation uses the existing three legacy demonstration records or an empty real workspace. Data was not rewritten to match the mock.

## Findings and resolved iterations

1. P2 — Sparse catalogue left narrow cards in an otherwise empty five-column row. Changed desktop grid to auto-fit available products, with a 165px minimum. Latest capture shows three balanced cards; larger catalogues fit up to five at the reference width.
2. P2 — Hero was unnecessarily tall and workflow labels wrapped awkwardly. Reduced desktop hero padding, heading size, journey icon dimensions and spacing. Post-fix capture preserves a clear primary URL action and readable three-step workflow.
3. P2 — Product category badges inherited the dark application badge palette. Scoped ivory-card badges to sage backgrounds and dark text. Verified in the post-fix capture.
4. P1 — Add-product action was absent on the populated home view when tasks were due. Restored a visible, labelled add-product action alongside the collection heading. Regression tests now cover the existing new-draft workflow again.
5. P2 — Global search could leave old filters/error text active. Search now resets library filters, and editing the global input clears its accessible error. Verified by UI and regression tests.

No actionable P0/P1/P2 findings remain for the agreed production adaptation.

## Required fidelity surfaces

- Typography: existing embedded Noto Sans Thai retained; large 44px desktop headline, readable Thai/English labels, consistent hierarchy. Mobile headline wraps deliberately, inputs remain readable and touch controls remain usable.
- Layout rhythm: 224px desktop sidebar, prominent pill-shaped paste field, glass category rail, ivory product/results panels, narrow productivity column, and quick tools. Tablet uses a menu; mobile uses bottom navigation and puts content tools before analytics.
- Colors: graphite/charcoal, ivory, sage and champagne replace dominant cyan/violet neon. Glass is more opaque than the source to meet the accompanying readability requirement. Text is protected from detailed background imagery.
- Imagery: one generated warm daylight workspace photograph is embedded as a compressed 36.8KB WebP. Existing product images are preserved. Records without images explicitly say so; fabricated product photos are not attached to user records. Outline icons are vendored Tabler 3.31.0 with MIT license embedded in standalone output. Existing SP identity retained.
- Copy/content: the main Thai paste-link headline follows the reference. Automatic fetch, multi-marketplace support, PRO subscriptions, bestseller/trending claims and invented discounts are omitted because they are not real capabilities. Commission remains THB/order, not an invented percentage. Results retain the existing 72-hour attribution basis.

The hero controls, product card labels and sidebar were also examined as focused regions at native image resolution; additional crops were unnecessary because their typography and spacing were legible in the paired 1536px captures.

## Interaction and accessibility checks

- Direct cloud-browser checks: demo isolation, global search, filtered result, home navigation, and price sorting.
- Regression: old schema-v2 data, drafts/refresh, TH/EN, import/merge/recovery, Story Studio scenes, Undo/Redo/revisions, teleprompter, keyboard navigation, and reduced motion.
- Responsive checks: all eight routes in both languages at 320, 390, 768, 1024 and 1440px; matched reference capture at 1536px. No horizontal page overflow.
- Browser console: no application errors observed. Cloud browser logged extension metadata errors from `chrome-extension://`, unrelated to the application. Automated pageerror assertions passed.
- Limitation: physical iOS/Safari was not exercised in this environment.

## Follow-up polish

The source's brighter glass, profile portrait, notifications, PRO card, marketplace chips and revenue chart require actual product capabilities or source data before they should appear. This implementation intentionally preserves the existing app rather than presenting them as live features.
