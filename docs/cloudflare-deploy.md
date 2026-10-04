# Cloudflare Workers deployment

Worker: sp-affiliate. Keep the existing Git integration, branch main, root /,
and deploy command: npx wrangler deploy. No GitHub Actions deployment is needed.

The application already commits its self-contained index.html build output.
wrangler.json explicitly deploys that artifact as an assets-only Worker.
.assetsignore denies every file except index.html and _headers.
This works even when the dashboard Build command is empty: no missing dist
directory, automatic project setup, or dependency upload is required.

When changing application source, run npm run build:site and commit the updated
index.html as usual. That command also refreshes _headers from the shared
public/_headers source. Vercel continues to serve its separate dist output.

## Why builds failed

Without a tracked Wrangler configuration, automatic setup selected the repository
root and tried uploading 3,314 assets, including a 128 MiB
node_modules/workerd/workerd binary. Cloudflare's per-asset limit is 25 MiB.
The explicit allowlist excludes dependencies, source, tests, local credentials and
deployment configuration, including any new files added later.

## Verification

- node --test tests/cloudflare-assets.test.mjs
- For the real Wrangler upload-manifest check:
  WRANGLER_CLI=/path/to/wrangler/bin/wrangler.js node --test tests/cloudflare-assets.test.mjs
- The integration test includes a 128 MiB dependency fixture, checks the served
  HTML and response headers, and requires private/source/dependency paths to 404.
- npx wrangler deploy --dry-run validates configuration without publishing.

The app uses hash routes, so unknown file paths return 404 rather than the HTML
application. Supabase account/provider settings and existing public domains are
not changed by this configuration.

Official references:
- https://developers.cloudflare.com/workers/static-assets/binding/
- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
