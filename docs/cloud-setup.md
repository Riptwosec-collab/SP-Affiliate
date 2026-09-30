# SP-Affiliate 2.2: setup and verified status

## Current delivery

| Component | Status |
| --- | --- |
| Offline HTML, Thai/English, original v2 data | Implemented; Chromium regression suite passes |
| Supabase database + Edge API | Deployed to `gfqkexnqbjtuwsyqacsw`; anonymous calls denied |
| Account UI, isolated browser workspaces, revision-aware sync | Implemented; controlled two-account browser tests pass |
| Signup email / password recovery email | UI implemented; actual email delivery and hosted redirects not yet verified |
| Shopee Affiliate API | Adapter implemented; no credentials or live verification |
| OpenAI | Adapter implemented; no credentials or live verification |
| Public website | Build ready; not deployed in this change (Vercel connector returned `Tool deploy_to_vercel not found`) |
| Safari / physical iPhone | Not verified; WebKit runtime dependencies could not be installed in this environment |

Do not treat fixture tests as successful calls to real Shopee, OpenAI, or email delivery.

## Hosting the frontend

Use Node.js 22+ and the repository's native Git integration:

```sh
npm ci
npm run build:site
```

Publish `dist/`. `vercel.json` supplies these settings for Vercel; `public/_headers` supplies the equivalent static response headers for Cloudflare Pages. No GitHub Actions deployment workflow is added. The root `index.html` is also a standalone offline build containing all application code, the pinned Auth SDK and fonts.

After selecting a production URL, add that **exact HTTPS origin/path** to Supabase Authentication URL Configuration's allowed redirects. Verify signup, email confirmation, reset-password email and the new-password form using an account you control. Review SMTP configuration if messages are not delivered. The connected Supabase project is shared: this change does not alter its site URL, SMTP, email templates or unrelated settings.

File URLs support local work. Use hosted HTTPS for account email callbacks. Browser data is separated by origin: export JSON before moving from a local file to the website.

## Database and Edge Function

The connected project already has the additive `sp_affiliate_cloud_workspaces` and `sp_affiliate_atomic_quota` migrations. **Do not rerun the create-table schema on that project.**

For a new Supabase project, apply `db/schema.sql` once, deploy `supabase/functions/sp-affiliate-api/index.ts` together with `server/providers.mjs`, and retain `verify_jwt = true`. Change only the public project URL/publishable key in `src/cloud-config.js`, then rebuild. Never place a service-role key in that file.

Tables and RPCs are prefixed `sp_affiliate_`. Workspace RLS checks `auth.uid()` against `owner_id`. The save RPC compares revisions atomically and raises `CLOUD_CONFLICT` instead of overwriting a newer copy. The quota table is deliberately inaccessible to client roles, with RLS and no client policies; only the Edge service role can call its quota RPC. An advisor notice about that table having no policy is intentional.

In the Supabase Edge Function Secrets settings, configure only these application-specific values:

| Secret | Purpose |
| --- | --- |
| `SP_AFFILIATE_SHOPEE_APP_ID` | Approved Shopee Affiliate Open API application |
| `SP_AFFILIATE_SHOPEE_SECRET` | That application's signing secret |
| `SP_AFFILIATE_OPENAI_API_KEY` | Dedicated OpenAI project key |
| `SP_AFFILIATE_OPENAI_MODEL` | Model available to the key that supports Responses structured JSON output |

Keep secrets out of Git, screenshots, chat and the HTML. `.env.example` lists names only. Supabase supplies `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` inside its Edge runtime.

The Shopee adapter uses the Thailand Affiliate Open API and SHA256 authorization. Its exact `productOfferV2` fields must still be verified with the approved account; an API/schema rejection remains an error. Unsupported short links fail explicitly instead of inventing product details. Price ranges do not become a chosen variant's price, and the original affiliate URL is preserved.

Per UTC day, the backend allows 10 AI / 40 Shopee requests per account and 100 AI / 500 Shopee requests overall. Failed upstream attempts consume a reserved request; requests denied by the per-account quota do not consume the global quota. These counts are not a currency spending cap—set a provider project budget separately before enabling paid use.

The online API requires an authenticated, email-confirmed, non-anonymous user. AI receives only the selected product evidence and brief after an explicit action; images, passwords and the full workspace are excluded. Output remains a draft requiring human review. Only a successful provider request changes the visible status to “Last request succeeded”; having keys alone means “Configured, unverified.”

## Sync behavior and recovery

Guest data, demo data and each signed-in account have separate IndexedDB namespaces. Signing in never uploads the guest workspace. “Copy original local records” explicitly merges saved guest records without deleting the originals. Password inputs are excluded from drafts and exports.

First upload/download is manual. Automatic upload is opt-in after a first sync. A conflicting edit stops automatic upload: review the cloud copy, export it if needed, then choose what to keep. Downloading creates a local pre-sync backup accessible in Settings; export that JSON and import it to restore. Local drafts remain available offline. Late responses are discarded when the account or workspace changes.

Local account caches remain on that browser after sign-out for offline recovery. Use a private browser session on shared devices; signing out is not a local data purge.

## Verification recorded for this change

```sh
npm test
npm run test:cloud
npm run test:server
```

- 15 Chromium workflow cases: v2 migration, drafts, reload, Thai/English, undo/redo, versions, JSON migration, standalone file and 393/768/1440 px layouts.
- 7 cloud browser cases with controlled Auth/REST fixtures: credential exclusion, guest/account isolation, conflict and recovery, missing-provider status, AI evidence mapping, delayed auth during mode switch, delayed cloud preview during account switch.
- 11 backend cases: PostgreSQL RLS/revisions/quotas and provider URL, redirects, signing, errors, payload filtering and missing-key behavior.
- Live checks: anonymous table/API access denied; quota rejection leaves global count unchanged in a rolled-back transaction. No customer records or test emails were created.
- Independent review's four findings were fixed and regression-tested.

Use `CHROMIUM_EXECUTABLE=/path/to/chromium` if needed. `npm run test:webkit` is supplied for a machine with Playwright WebKit dependencies; it has **not passed here**. Finish real email, provider, hosted HTTPS and physical iPhone checks before calling the entire online service production-verified.
