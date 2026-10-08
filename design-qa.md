# Premium Emerald — design QA

final result: passed

## Target and comparison

- Target: supplied `upload/image(5).png` (1672 × 941) and `Pasted text(2).txt`.
- Reference-size capture: `test-results/emerald-reference-viewport.png` (1672 × 941 CSS pixels, empty real workspace).
- Source and implementation images were opened together and compared at the same desktop viewport. Final adjustments were then recaptured and inspected.
- Other captures: `test-results/storefront-mobile.png`, `storefront-products.png` and `storefront-desktop.png`.
- Live local preview inspected through the cloud browser. Verified demo mode, product search, combined content filters, clear filters, TH/EN and post-age metric selection. Browser extension metadata errors were unrelated to the application; automated pageerror checks passed.

## Fidelity and resolved findings

- 246px sidebar, 72px header, 20px dashboard gutter and roughly 394px productivity column align with the supplied desktop composition. The right column starts alongside the hero.
- Shared charcoal/emerald tokens, mint active states, gold accents, Thai/English navigation sublabels, restrained card highlights and embedded Thai typography applied across all eight routes, forms and dialogs.
- Global photograph and its CSS payload removed. No decorative body pseudo-elements, global graphics or continuous background animation. The appearance preference now switches to flat surfaces.
- Generated commerce illustration refined to the target's tilted product/browser card, headphones, orange bag and mint chart. Separate compact empty-library illustration. Both optimized WebP assets embedded in standalone output (35,362 bytes before base64).
- P2 fixed: oversized hero and detached right column. Matched desktop positioning and shortened the paste-link field to the target proportion.
- P2 fixed: empty-state buttons inherited a vertical desktop layout. Restored centered inline actions.
- P1 fixed: native sort select overflowed at 320px in English. Removed its intrinsic minimum width; all tested routes/languages now fit.
- P2 fixed: homepage filter state could diverge from recovered input fields. Optional presentation state is saved with the existing editing session and reset between workspaces. Existing version-1 sessions and schema-v2 business data remain compatible.
- P2 fixed: layout/status redraws now return keyboard focus to the selected control.

No actionable P0/P1/P2 findings remain for this production adaptation.

## Intentional production differences

This is not a pixel-identical static mock. The reference contains a fictional profile, notifications, PRO subscription, unsupported marketplaces, AI claims, 3/5 task progress and invented revenue. These are not presented as real features or data.

- Real empty workspace: 0/0 planned tasks and missing metrics shown as dashes with clear empty states.
- Populated workspace: today's actual plan tasks, latest observations at the selected post age, confirmed post-attributed commission, and clicks grouped by Bangkok publication date. No interpolation of absent observations or invented zeroes.
- Content filters derive from saved stories and registered posts; product evidence status remains separate.
- Demo data remains explicitly labeled and isolated. Freeform categories, authored Thai/English text and missing-photo states are preserved.
- Existing SP brand and Tabler library icons retained; generated assets and font rendering can differ from source pixels. Small spacing differences accommodate real labels and accessible controls.

## Verification scope

53 regression checks: upgrade 15, storefront 14, cloud 7, server/database 11, catalogue 6. Responsive route matrix covers 320, 390, 768, 1024, 1440, 1680 and 1920px in TH and EN. Legacy data, reload, wizard drafts, backup/import, offline HTML, scene cards, Undo/Redo and revision restoration included.

Physical iPhone/Safari and real external provider credentials were not exercised. Existing Vercel/Cloudflare configuration, environment variables and CI workflows are unchanged.
