# Premium creator storefront — implementation brief

The user supplied the complete dark storefront specification and explicitly requested implementation. This is a visual/UX upgrade of the existing vanilla-JavaScript app, retaining all eight hash routes, v2 data, draft journals, scoring, stories, cloud identity and provider behavior.

- New midnight/blue design tokens, full-width sticky header, compact workspace navigation and accessible mobile menu. Always-visible TH/EN segmented control.
- Editorial hero with original vector device artwork (decorative, not a product listing), horizontal category strip, real saved-product cards, filters/search and audio/creator editorial panels.
- Categories filter the existing catalogue by product text without rewriting product records. No fabricated retail inventory, prices, checkout, support service, availability or integration claims. Saved-products bag opens the existing selling list.
- Keep the original dashboard tasks, evidence readiness, metrics and draft recovery beneath the storefront presentation. All existing screens receive the same surface, type, form and interaction system.
- Move static UI translations to src/translations.js. Translate interface chrome and labels; user-entered records and authored scripts retain their original content/language.
- Preserve a single self-contained HTML export. Inline device vectors and embedded fonts work offline; real product image URLs retain original behavior.
- Verify old workflow/cloud suites plus storefront filtering, language persistence, keyboard/mobile navigation, empty catalogue, real imagery/records and reduced motion. Publish through the existing Git→Vercel integration after verification.

The referenced dark image was not attached to this turn. The supplied proportions, colors and content hierarchy are the implementation reference.
