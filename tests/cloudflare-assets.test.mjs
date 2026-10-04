import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,writeFile,copyFile,truncate,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);
const root=new URL('../',import.meta.url);
test('Cloudflare has explicit static-only deployment and synchronized headers',async()=>{
 const config=JSON.parse(await readFile(new URL('wrangler.json',root),'utf8'));
 assert.equal(config.name,'sp-affiliate');
 assert.equal(config.assets.directory,'.');
 assert.equal(config.main,undefined);
 assert.equal(config.assets.not_found_handling,'404-page');
 assert.equal(await readFile(new URL('_headers',root),'utf8'),await readFile(new URL('public/_headers',root),'utf8'));
 const html=await readFile(new URL('index.html',root));
 assert.ok(html.length<25*1024*1024);
});
test('Wrangler excludes oversized dependencies and private files from its upload manifest',{skip:!process.env.WRANGLER_CLI,timeout:60000},async()=>{
 const dir=await mkdtemp(join(tmpdir(),'sp-assets-'));
 try{
  for(const file of ['wrangler.json','.assetsignore','index.html','_headers'])await copyFile(new URL(file,root),join(dir,file));
  await mkdir(join(dir,'node_modules/workerd'),{recursive:true});
  await writeFile(join(dir,'node_modules/workerd/workerd'),'');await truncate(join(dir,'node_modules/workerd/workerd'),128*1024*1024);
  await mkdir(join(dir,'src'),{recursive:true});await writeFile(join(dir,'src/private.js'),'not a public asset');
  await writeFile(join(dir,'.env'),'TEST_ONLY=not-a-real-secret');
  await writeFile(join(dir,'package.json'),'{"name":"not-public"}');
  const args=[process.env.WRANGLER_CLI,'deploy','--dry-run'];
  const options={cwd:dir,env:{...process.env,WRANGLER_SEND_METRICS:'false',WRANGLER_LOG:'debug',CI:'true'},timeout:25000,maxBuffer:4*1024*1024};
  const {stdout,stderr}=await exec(process.execPath,args,options);
  const output=stdout+stderr;
  assert.match(output,/--dry-run: exiting now/);
  for(const path of ['node_modules/workerd/workerd','src/private.js','.env','package.json','wrangler.json','.assetsignore']){
   assert.ok(output.includes('Ignoring asset: '+path),path+' must be excluded from upload');
  }
  // Without the allowlist the exact screenshot failure must reproduce.
  await rm(join(dir,'.assetsignore'));
  await assert.rejects(exec(process.execPath,args,options),error=>/Asset too large/.test(error.stdout+error.stderr)&&/128 MiB/.test(error.stdout+error.stderr));
 }finally{await rm(dir,{recursive:true,force:true})}
});
