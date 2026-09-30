import test from 'node:test';
import assert from 'node:assert/strict';
import { validateShopeeURL, resolveShopeeURL, shopeeAuthorization, normalizeOffer, createHandler } from '../server/providers.mjs';
test('Shopee rejects private hosts, credentials, non-HTTPS and ports',()=>{
  for(const url of ['http://shopee.co.th/product/1/2','https://127.0.0.1/','https://shopee.co.th.evil.test/','https://u:p@shopee.co.th/','https://shopee.co.th:444/'])assert.throws(()=>validateShopeeURL(url));
  assert.equal(validateShopeeURL('https://s.shopee.co.th/abc').hostname,'s.shopee.co.th');
});
test('redirect destination is checked before any second request',async()=>{
  let calls=0;await assert.rejects(resolveShopeeURL('https://s.shopee.co.th/abc',async()=>{calls++;return new Response(null,{status:302,headers:{location:'http://169.254.169.254/'}})}));assert.equal(calls,1);
});
test('canonical IDs remain exact and link is not fetched',async()=>{
  const r=await resolveShopeeURL('https://shopee.co.th/product/123/9007199254740993',()=>{throw Error('unexpected fetch')});assert.equal(r.itemId,'9007199254740993');assert.equal(r.shopId,'123');
});
test('signature uses exact bytes and no secret is returned',async()=>{
  const a=await shopeeAuthorization('123','private-secret','{"query":"{}"}',1700000000);assert.match(a,/^SHA256 Credential=123, Timestamp=1700000000, Signature=[a-f0-9]{64}$/);assert.ok(!a.includes('private-secret'));
});
test('range pricing is not represented as exact variant price',()=>{
  const r=normalizeOffer({itemId:'2',shopId:'1',productName:'Test',priceMin:'10',priceMax:'20',imageUrl:'javascript:alert(1)',commissionRate:'0.1'});assert.equal(r.price,null);assert.equal(r.imageUrl,'');assert.equal(r.commissionRate,10);
});
test('API denies unauthenticated actions and missing providers honestly',async()=>{
  const handler=createHandler({env:()=>undefined,fetch:async()=>{throw Error('unexpected upstream')}});
  assert.equal((await handler(new Request('https://test/status'))).status,401);
});
const baseEnv={SUPABASE_URL:'https://project.supabase.co',SUPABASE_ANON_KEY:'public-key',SUPABASE_SERVICE_ROLE_KEY:'service-secret'};
const validUser={id:'00000000-0000-4000-8000-000000000001',email_confirmed_at:'2026-01-01T00:00:00Z'};
const request=body=>new Request('https://test/api',{method:'POST',headers:{authorization:'Bearer user-token','content-type':'application/json'},body:JSON.stringify(body)});
function setup(extra={},responses={}){const calls=[];const handler=createHandler({env:k=>({...baseEnv,...extra})[k],fetch:async(url,options)=>{calls.push({url,options});if(url.endsWith('/auth/v1/user'))return Response.json(validUser);if(url.endsWith('/sp_affiliate_consume_limit'))return Response.json(responses.quota??true);if(url.includes('open-api.affiliate'))return Response.json(responses.shopee||{errors:[{message:'Rejected provider credentials'}]});if(url.includes('api.openai.com'))return Response.json(responses.ai);throw Error('Unexpected request '+url)}});return {handler,calls}}
test('configured status never claims verified, missing keys never call providers',async()=>{const {handler,calls}=setup();const status=await (await handler(request({action:'status'}))).json();assert.deepEqual(status,{shopee:'not_configured',ai:'not_configured'});const r=await handler(request({action:'shopee',url:'https://shopee.co.th/product/1/2'}));assert.equal(r.status,503);assert.equal((await r.json()).error,'SHOPEE_NOT_CONFIGURED');assert.ok(calls.every(c=>c.url.endsWith('/auth/v1/user')))});
test('daily limit prevents paid provider request',async()=>{const {handler,calls}=setup({SP_AFFILIATE_SHOPEE_APP_ID:'123',SP_AFFILIATE_SHOPEE_SECRET:'secret'},{quota:false});assert.equal((await handler(request({action:'shopee',url:'https://shopee.co.th/product/1/2'}))).status,429);assert.ok(!calls.some(c=>c.url.includes('open-api.affiliate')))});
test('upstream credential errors do not reveal upstream body or secrets',async()=>{const {handler}=setup({SP_AFFILIATE_SHOPEE_APP_ID:'123',SP_AFFILIATE_SHOPEE_SECRET:'secret'});const r=await handler(request({action:'shopee',url:'https://shopee.co.th/product/1/2'}));assert.equal(r.status,502);assert.deepEqual(await r.json(),{error:'SHOPEE_API_REJECTED'})});
test('AI sends only selected evidence and never uploads workspace or images',async()=>{const result={summary:'Review evidence',strengths:[],gaps:['No evidence'],angles:[]};const {handler,calls}=setup({SP_AFFILIATE_OPENAI_API_KEY:'private-ai-key',SP_AFFILIATE_OPENAI_MODEL:'configured-model'},{ai:{status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(result)}]}]}});const r=await handler(request({action:'ai',task:'analysis',language:'en',product:{title:'Product',dims:Array.from({length:7},()=>({})),imageUrl:'DO_NOT_SEND_IMAGE',otherProducts:'DO_NOT_SEND_RECORDS'},workspace:'DO_NOT_SEND_WORKSPACE'}));assert.equal(r.status,200);const body=calls.find(c=>c.url.includes('api.openai.com')).options.body;assert.ok(!body.includes('DO_NOT_SEND'));assert.equal(JSON.parse(body).store,false);assert.deepEqual((await r.json()).result,result)});
