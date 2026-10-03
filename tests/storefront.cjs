const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
(async()=>{
 const server=http.createServer((req,res)=>{res.setHeader('content-type','text/html;charset=utf-8');res.end(fs.readFileSync(path.join(__dirname,'../index.html')))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
 let passed=0,failed=0;fs.mkdirSync(path.join(__dirname,'../test-results'),{recursive:true});
 async function test(name,fn){const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(5000);try{await p.goto('http://127.0.0.1:'+server.address().port);await p.waitForFunction(()=>typeof state!=='undefined'&&!!state&&document.querySelector('.store-hero'));await fn(p);assert.deepEqual(errors,[]);passed++;console.log('PASS',name)}catch(e){failed++;console.error('FAIL',name,e.message);await p.screenshot({path:path.join(__dirname,'../test-results/storefront-failure-'+failed+'.png'),fullPage:true})}finally{await context.close()}}
 await test('empty storefront is honest and preserves all workspace routes',async p=>{
  assert.equal(await p.locator('.showcase-card').count(),0);assert.ok(await p.locator('.store-empty').isVisible());
  assert.equal(await p.locator('#nav [data-page]').count(),8);
  await p.locator('#brand-home').click();assert.equal(await p.evaluate(()=>page),'today');
  await p.screenshot({path:path.join(__dirname,'../test-results/storefront-desktop.png'),fullPage:true});
 });
 await test('real saved products filter without changing records or inventing prices',async p=>{
  const before=await p.evaluate(async()=>{state=demoData();state.products[0].title='MacBook creator test';state.products[1].title='iPhone camera test';state.products[2].title='AirPods audio test';state.products.forEach(x=>{x.variant='TEST';x.usecase='User authored content'});state.products[1].price=null;await persist();render();return JSON.stringify(state)});
  assert.equal(await p.locator('.showcase-card').count(),3);
  await p.locator('.category-tile[data-category=iphone]').click();assert.equal(await p.locator('.showcase-card').count(),1);
  assert.ok((await p.locator('.showcase-card').innerText()).includes('iPhone camera test'));
  assert.ok((await p.locator('.showcase-price').innerText()).includes('ยังไม่ระบุราคา'));
  await p.locator('[data-action=lang][data-lang=en]').click();assert.ok((await p.locator('.showcase-price').innerText()).includes('Price not recorded'));
  assert.equal(await p.evaluate(()=>JSON.stringify(state)),before);
  await p.locator('.filter-chips [data-category=all]').focus();await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>document.activeElement.dataset.category),'all');assert.equal(await p.evaluate(()=>document.activeElement.parentElement.className),'filter-chips');assert.equal(await p.locator('.showcase-card').count(),3);
  await p.locator('#store-search').click();assert.equal(await p.evaluate(()=>document.activeElement.id),'productSearch');
  await p.locator('#productSearch').fill('iPhone');assert.equal(await p.locator('.product-title').count(),1);
 });
 await test('UI dictionary covers both languages and preference persists',async p=>{
  assert.deepEqual(await p.evaluate(()=>Object.keys(TRANSLATIONS.th).sort()),await p.evaluate(()=>Object.keys(TRANSLATIONS.en).sort()));
  await p.locator('[data-lang=en]').click();assert.equal(await p.locator('html').getAttribute('lang'),'en');
  assert.equal(await p.locator('[data-lang=en]').getAttribute('aria-pressed'),'true');
  assert.ok((await p.locator('h1').innerText()).includes('Your Store.'));
  await p.reload();await p.waitForSelector('.store-hero');assert.equal(await p.locator('html').getAttribute('lang'),'en');
  for(const route of ['today','analyze','products','studio','planner','results','lab','settings']){
   await p.evaluate(r=>navigateTo(r),route);
   const thai=await p.locator('#main').innerText();assert.ok(!/[\u0e00-\u0e7f]/.test(thai),'Unexpected Thai UI on '+route);
  }
  await p.locator('[data-lang=th]').click();assert.equal(await p.locator('html').getAttribute('lang'),'th');
 });
 await test('mobile menu keyboard escape and route actions work',async p=>{
  await p.setViewportSize({width:390,height:844});
  await p.locator('#menu-toggle').click();assert.ok(await p.locator('#workspace-drawer').isVisible());
  assert.equal(await p.locator('#menu-toggle').getAttribute('aria-expanded'),'true');
  await p.keyboard.press('Escape');await p.waitForFunction(()=>document.querySelector('#menu-toggle').getAttribute('aria-expanded')==='false');assert.equal(await p.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
  assert.equal(await p.evaluate(()=>document.activeElement.id),'menu-toggle');
  for(const route of ['today','analyze','products','studio','planner','results','lab','settings']){
   await p.locator('#menu-toggle').click();await p.locator('#workspace-drawer [data-page='+route+']').click();
   assert.equal(await p.evaluate(()=>page),route);assert.equal(await p.locator('#workspace-drawer').isVisible(),false);
  }
  await p.locator('#brand-home').click();await p.screenshot({path:path.join(__dirname,'../test-results/storefront-mobile.png'),fullPage:true});
 });
 await test('skip link focuses current content without changing route or draft',async p=>{
  await p.evaluate(()=>navigateTo('analyze'));await p.locator('#title').fill('Keep my current draft');
  const hash=await p.evaluate(()=>location.hash);
  await p.locator('.skip-link').focus();await p.keyboard.press('Enter');
  assert.equal(await p.evaluate(()=>page),'analyze');
  assert.equal(await p.evaluate(()=>location.hash),hash);
  assert.equal(await p.evaluate(()=>document.activeElement.id),'main');
  assert.equal(await p.locator('#title').inputValue(),'Keep my current draft');
 });
 await test('responsive layouts and reduced motion remain accessible',async p=>{
  await p.evaluate(async()=>{state=demoData();await persist();render()});
  for(const width of [320,390,768,1024,1440]){
   await p.setViewportSize({width,height:900});
   for(const language of ['th','en']){
    await p.locator('[data-lang='+language+']').click();
    for(const route of ['today','analyze','products','studio','planner','results','lab','settings']){
     await p.evaluate(r=>navigateTo(r),route);
     const measured=await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
     assert.ok(measured.scroll<=measured.width+1,route+' '+language+' @ '+width+': '+JSON.stringify(measured));
    }
   }
  }
  await p.evaluate(()=>navigateTo('today'));
  assert.equal(await p.locator('.will-reveal').count(),0);
  await p.screenshot({path:path.join(__dirname,'../test-results/storefront-products.png'),fullPage:true});
 });
 await browser.close();await new Promise(r=>server.close(r));console.log(passed+' passed, '+failed+' failed');process.exitCode=failed?1:0;
})().catch(e=>{console.error(e);process.exit(1)});
