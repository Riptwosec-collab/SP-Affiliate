import './build.mjs';
import {mkdir,copyFile} from 'node:fs/promises';
await mkdir(new URL('../dist/',import.meta.url),{recursive:true});
await copyFile(new URL('../index.html',import.meta.url),new URL('../dist/index.html',import.meta.url));
await copyFile(new URL('../public/_headers',import.meta.url),new URL('../dist/_headers',import.meta.url));
// Cloudflare deploys the committed HTML through the root asset allowlist.
await copyFile(new URL('../public/_headers',import.meta.url),new URL('../_headers',import.meta.url));
console.log('Static deployment directory: dist/');
