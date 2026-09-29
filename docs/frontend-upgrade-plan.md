# Frontend rounds 1–2 implementation plan
Goal: Make the existing bilingual local workspace easier to use without replacing records or connecting online services.
Architecture: Split the existing code by feature, preserve IndexedDB name/version and all v2 record schemas. Store recoverable editing sessions under separate keys in the same object store. Build dependency-free index.html from ordered source units and embedded fonts.
Spec: User-approved rounds 1 and 2 from this conversation.
Review focus: interrupted saves; real/demo cross-contamination; old JSON files; edited story revision restoration; mobile keyboard and workflow navigation.
- [x] Split source and preserve a legacy fixture. Test importing v2 data and opening existing DB records.
- [x] Add serialized draft autosave/recovery, URL navigation/back, saved-state reporting and form errors. Test refresh after typing, navigation recovery, quota failure and mode isolation.
- [x] Add 4-step product form and product search/filters/table. Test draft steps, required-field routing, exact matches and no-match states.
- [x] Add Studio tabs and scene cards, independent history per story, complete revision snapshots with safe restoration, hook library and copy controls, teleprompter/rehearsal. Test undo/redo, restoring old and new revisions, TH/EN persistence and prompt controls.
- [x] Build, run browser regression in file mode and responsive checks at 393/768/1440 widths, review changes and prepare a non-force commit for GitHub.
Ruling: existing dedicated checkout is isolated on a feature branch; no extra worktree needed.
Ruling: retain schemaVersion 2 for existing business records; session drafts are separately versioned (1) to keep v2 JSON backups compatible.

Verification: Chromium browser regression uses the original HTML fixture to populate the existing v2 IndexedDB, then opens the rebuilt app at the same origin. Additional tests cover file URLs, immediate reload, data ownership across editors and merge, separate workspace modes, business-write failure reporting, legacy and structured revision restoration. UI screenshots checked with a populated scene editor at desktop and mobile sizes. Shopee/AI remain disconnected.
Review fixes: separate Studio product selection; retain per-product drafts; suppress blur/change autosave during DOM replacement; preserve failed business-save status; validate backup draft ownership and avoid replacing imported drafts with empty local drafts.
