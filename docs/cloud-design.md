# SP-Affiliate cloud extension

User instruction: implement all remaining backend, Shopee/AI, account/sync, deployment and mobile verification work. Preserve the bilingual offline HTML and all v2 records.

## Architecture

Keep the existing local workspace. Add Supabase Auth and an isolated `sp_affiliate_*` data model to the connected Supabase project, without modifying existing applications. Signed-in accounts use separate IndexedDB keys; guest records and demo records remain intact. A pinned Auth SDK is bundled into the single HTML. Password fields never enter draft capture, backups, logs or analytics.

Sync stores the validated v2 backup envelope with editing drafts. Writes compare the expected cloud revision atomically; conflicts never overwrite the remote copy. Downloads require confirmation and create a local recovery checkpoint. Initial upload/download is explicit. Automatic upload is opt-in after the first successful sync. Offline writes stay local.

Shopee and AI execute in an authenticated Supabase Edge Function. Server secrets use the `SP_AFFILIATE_` prefix. Provider requests have bounded sizes, timeouts, and database-enforced daily limits. Shopee URLs are HTTPS and host-allowlisted at every redirect. Imported fields are previewed; original affiliate links, variant choices and user evidence are preserved. AI receives only the chosen product evidence and brief after the user presses Generate; output is an unready draft and never changes rubric scores.

Provider status distinguishes unconfigured, configured but unverified, successful and failed. Missing credentials must not produce mock success. No paid plan, credential reuse from other apps, or email to a third party is authorized.

## Delivery limits

The connected Vercel deployment tool returned `Tool deploy_to_vercel not found`; no Vercel token is present. Prepare deployable static output and native Git hosting configuration, and publish through a working authorized channel if one becomes available. Do not create unrelated deployment workflows as a substitute.

Shopee App ID/secret and an AI API key were not present. Implement and test adapters against controlled fixtures; live provider verification remains blocked until server-side credentials are supplied. WebKit automation is supplemental to Chromium; physical iPhone testing must be reported separately and cannot be fabricated.
