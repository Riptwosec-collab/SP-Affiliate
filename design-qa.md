# Premium Editorial Commerce — design QA, v2.7

Result: passed in the tested Chromium environment on 2026-10-09.

## Design target

The supplied written brief replaces the earlier Emerald image reference. This release uses a light retail presentation: #F5F5F7 canvas, white cards, #1D1D1F text, blue actions and restrained shadows. It does not claim pixel parity with an unavailable screenshot.

## Presentation changes

- Wide editorial hero with a separate introduction, manual affiliate-link entry and honest provider status.
- Minimal desktop navigation, mobile workspace drawer and bottom navigation; all eight routes retained.
- Floating category icons, pill search and filters, native horizontal product rail with keyboard focus, and retained list view.
- Larger product titles and image area. Only saved product images are used; missing images remain explicitly labelled. Ready-content cards may use a black surface. No invented sales or promotions.
- Shared light styling for the four-step product form, Story Studio, scene cards, planner, results, lab, settings and dialogs.
- Subtle 5px card lift and hero entrance, reduced-motion support, visible focus rings and optional flat surfaces.
- Summary widgets follow the catalogue and recent stories. Mobile cards show the next card and preserve native horizontal scrolling.

## Resolved finding

At 320px, an absolutely positioned screen-reader rating label in an offscreen product card escaped the rail's overflow area and widened the document. Positioning each card relatively contains the label. The entire route/language/viewport matrix now passes without hiding document overflow.

## Verification

54 automated tests passed against the built HTML and existing server/catalogue modules:

- Storefront: 15, including rail arrow-key scrolling and focus reaching offscreen actions without changing records.
- Upgrade: 15, including legacy database/JSON, draft recovery, Undo/Redo, revision restore, import/merge and standalone offline HTML.
- Cloud: 7, covering guest/account/demo separation, conflicts, credential exclusion and honest provider status.
- Server/database: 11, covering PostgreSQL access policy, quotas and provider boundaries.
- Catalogue: 6, covering custom categories, escaping, language/data preservation and recorded metrics.

The responsive matrix covers all eight routes in TH and EN at 320, 390, 768, 1024, 1440, 1680 and 1920px. Local browser visual inspection covered the empty home, populated demo cards, product form, Story script/scenes and settings. Desktop and mobile captures were inspected. No application page errors were reported by the browser suites.

The bundle still exports one self-contained HTML file. Fonts and SDK remain embedded. Decorative Emerald raster assets are no longer embedded; source assets remain available in the repository. No new dependencies, schema migrations or hosting settings were introduced.

## Limits

Physical iPhone/Safari was not tested. Provider behavior is covered by fixtures; no live Shopee or AI connection was enabled or claimed. Existing saved product photos and authored content are preserved.
