# Cloud extension implementation plan

Goal: add real authenticated backend/sync and provider adapters while retaining offline v2 workflows.
Spec: cloud-design.md. Execution: inline with final independent review.

- [x] Backend: SQL owner isolation, atomic revision comparison, usage limits; Edge Function verifies the user and protects secrets. Verify anonymous denial, cross-owner isolation, conflict and quota behavior.
- [x] Auth/sync: bundled SDK, account UI, separate browser namespaces, explicit import from guest, recoverable download, offline errors, conflict UI. Verify credentials never enter backups and account switching preserves guest data.
- [x] Providers: Shopee URL/signing/response validation and AI structured drafts; preview before applying; honest status. Verify hostile redirects, missing credentials, upstream errors and evidence-only requests.
- [ ] Verification/delivery: original Chromium suite, cloud scenarios, WebKit where executable, deployment smoke checks, README setup instructions, independent review, GitHub push.

Ruling: user already authorized all listed work and publishing; implementation proceeds without repeating approval. Connected shared Supabase gets only new prefixed tables/functions. No unrelated table, Auth email template or project-wide setting is changed.
Ruling: work occurs in a fresh dedicated clone on `upgrade/cloud-services` based on 53fbc69; prior checkout remains untouched.

Review focus: credentials entering generic draft capture; delayed writes crossing account boundaries; cloud conflict after offline edits; untrusted provider URLs/claims; missing keys incorrectly shown as Connected.

Verification: 15 original Chromium + 7 cloud browser + 11 backend cases pass. Independent review completed; four findings fixed with regressions. SQL/Edge backend is deployed and anonymous denial checked. See cloud-setup.md for the remaining live-provider, email, hosting and physical-device gates. These external verification items are intentionally not marked complete.
