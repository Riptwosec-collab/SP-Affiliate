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
  await p.setViewportSize({width:1672,height:941});await p.screenshot({path:path.join(__dirname,'../test-results/emerald-reference-viewport.png'),fullPage:false});
 });
 await test('real saved products filter without changing records or inventing prices',async p=>{
  const before=await p.evaluate(async()=>{state=demoData();state.products[0].title='Home creator test';state.products[0].category='Home';state.products[1].title='Beauty creator test';state.products[1].category='Beauty';state.products[2].title='Pet creator test';state.products[2].category='Pets';state.products.forEach(x=>{x.variant='TEST';x.usecase='User authored content'});state.products[1].price=null;await persist();render();return JSON.stringify(state)});
  assert.equal(await p.locator('.showcase-card').count(),3);
  await p.locator('.filter-chips [data-category="custom:Beauty"]').click();assert.equal(await p.locator('.showcase-card').count(),1);
  assert.ok((await p.locator('.showcase-card').innerText()).includes('Beauty creator test'));
  assert.ok((await p.locator('.showcase-price').innerText()).includes('ยังไม่ระบุราคา'));
  await p.locator('[data-action=lang][data-lang=en]').click();assert.ok((await p.locator('.showcase-price').innerText()).includes('Price not recorded'));
  assert.equal(await p.evaluate(()=>JSON.stringify(state)),before);
  await p.locator('.filter-chips [data-category=all]').focus();await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>document.activeElement.dataset.category),'all');assert.equal(await p.evaluate(()=>document.activeElement.parentElement.className),'filter-chips');assert.equal(await p.locator('.showcase-card').count(),3);
  await p.locator('#global-search-button').click();assert.equal(await p.evaluate(()=>document.activeElement.id),'productSearch');
  await p.locator('#productSearch').fill('Beauty');assert.equal(await p.locator('.product-title').count(),1);
 });
 await test('link entry and product metadata survive reload, language, save and backup',async p=>{
  await p.locator('#creator-link').fill('https://s.shopee.co.th/studio-test');
  await p.locator('[data-action=start-product-link]').click();
  assert.equal(await p.locator('#affiliate').inputValue(),'https://s.shopee.co.th/studio-test');
  await p.locator('#title').fill('Ceramic bowl');await p.locator('#variant').fill('White');
  await p.locator('#category').fill('Home & kitchen');await p.locator('#brand').fill('Mek Studio');await p.locator('#tags').fill('ceramic, tableware');
  await p.waitForFunction(()=>document.querySelector('#save-status').dataset.state==='saved');
  await p.reload();await p.waitForSelector('#category');assert.equal(await p.locator('#category').inputValue(),'Home & kitchen');
  await p.locator('[data-lang=en]').click();assert.equal(await p.locator('#brand').inputValue(),'Mek Studio');
  await p.locator('[data-action=product-step][data-step="1"]').click();
  await p.locator('#usecase').fill('Serve breakfast');
  await p.locator('[data-action=product-step][data-step="3"]').click();await p.locator('#product-submit').click();
  await p.waitForSelector('#productSearch');
  const record=await p.evaluate(()=>state.products[0]);assert.equal(record.category,'Home & kitchen');assert.equal(record.tags,'ceramic, tableware');
  const imported=await p.evaluate(()=>validateImport(backupPayload()).products[0]);assert.equal(imported.brand,'Mek Studio');
  await p.locator('#productSearch').fill('tableware');assert.equal(await p.locator('.product-title').count(),1);
  await p.locator('#productSearch').fill('');await p.locator('#productCategory').selectOption('custom:Home & kitchen');assert.equal(await p.locator('.product-title').count(),1);
  await p.reload();await p.waitForSelector('#productCategory');assert.equal(await p.locator('#productCategory').inputValue(),'custom:Home & kitchen');
 });
 await test('legacy categories stay optional and custom category markup is escaped',async p=>{
  const original=await p.evaluate(async()=>{state=demoData();await persist();render();return JSON.stringify(state)});
  assert.ok((await p.locator('.filter-chips').innerText()).includes('ยังไม่จัดหมวด'));
  assert.equal(await p.evaluate(()=>JSON.stringify(state)),original);
  await p.evaluate(()=>{state.products[0].category='<img src=x onerror=alert(1)>';state.products[0].brand='Custom';render()});
  assert.equal(await p.locator('.filter-chips img').count(),0);
  await p.locator('.filter-chips button').filter({hasText:'<img src=x onerror=alert(1)>'}).click();assert.equal(await p.locator('.showcase-card').count(),1);
  assert.equal(await p.evaluate(()=>document.activeElement.dataset.category),'custom:<img src=x onerror=alert(1)>');
  assert.equal(await p.evaluate(()=>validateImport(backupPayload()).products[0].category),'<img src=x onerror=alert(1)>');
  assert.ok(await p.evaluate(()=>{state.products[0].category={invalid:true};try{validateImport(backupPayload());return false}catch{return true}}));
 });
 await test('quick-entry Enter preserves an existing unfinished product',async p=>{
  await p.locator('#creator-link').fill('https://s.shopee.co.th/first-product');await p.locator('#creator-link').press('Enter');
  await p.locator('#title').fill('Keep this unfinished product');
  await p.locator('#brand-home').click();await p.locator('#creator-link').fill('https://s.shopee.co.th/second-product');await p.locator('#creator-link').press('Enter');
  assert.equal(await p.locator('#affiliate').inputValue(),'https://s.shopee.co.th/first-product');
  assert.equal(await p.locator('#title').inputValue(),'Keep this unfinished product');
  assert.ok((await p.locator('#toast').innerText()).includes('ร่างสินค้าที่ค้างไว้'));
 });
 await test('invalid quick link stays on home with an accessible error',async p=>{
  await p.locator('#creator-link').fill('javascript:alert(1)');await p.locator('[data-action=start-product-link]').click();
  assert.equal(await p.locator('#creator-link').getAttribute('aria-invalid'),'true');assert.ok(await p.locator('#creator-link-error').isVisible());
  assert.equal(await p.evaluate(()=>state.products.length),0);
 });
 await test('UI dictionary covers both languages and preference persists',async p=>{
  assert.deepEqual(await p.evaluate(()=>Object.keys(TRANSLATIONS.th).sort()),await p.evaluate(()=>Object.keys(TRANSLATIONS.en).sort()));
  await p.locator('[data-lang=en]').click();assert.equal(await p.locator('html').getAttribute('lang'),'en');
  assert.equal(await p.locator('[data-lang=en]').getAttribute('aria-pressed'),'true');
  assert.ok((await p.locator('h1').innerText()).includes('Paste a product link.'));
  await p.reload();await p.waitForSelector('.store-hero');assert.equal(await p.locator('html').getAttribute('lang'),'en');
  for(const route of ['today','analyze','products','studio','planner','results','lab','settings']){
   await p.evaluate(r=>navigateTo(r),route);
   const thai=await p.locator('#main').innerText();assert.ok(!/[\u0e00-\u0e7f]/.test(thai),'Unexpected Thai UI on '+route);
  }
  await p.locator('[data-lang=th]').click();assert.equal(await p.locator('html').getAttribute('lang'),'th');
 });
 await test('global search clears stale filters and supports links without losing drafts',async p=>{
  await p.evaluate(async()=>{state=demoData();await persist();render()});
  await p.locator('#global-query').fill('สายชาร์จ');await p.locator('#global-query').press('Enter');
  assert.equal(await p.locator('.product-title').count(),1);
  await p.locator('#productStatus').selectOption('archived');
  assert.equal(await p.locator('.product-title').count(),0);
  await p.locator('#global-query').fill('สายชาร์จ');await p.locator('#global-query').press('Enter');
  assert.equal(await p.locator('.product-title').count(),1);
  assert.equal(await p.locator('#productStatus').inputValue(),'all');
  await p.reload();await p.waitForSelector('#productSearch');assert.equal(await p.locator('#productSearch').inputValue(),'สายชาร์จ');
  await p.locator('#global-query').fill('https://example.com/unsupported');await p.locator('#global-query').press('Enter');
  assert.equal(await p.locator('#global-query').getAttribute('aria-invalid'),'true');
  await p.locator('#global-query').fill('https://s.shopee.co.th/global');await p.locator('#global-query').press('Enter');
  assert.equal(await p.locator('#affiliate').inputValue(),'https://s.shopee.co.th/global');
  await p.locator('#title').fill('Keep global draft');
  await p.locator('#global-query').fill('https://s.shopee.co.th/another');await p.locator('#global-query').press('Enter');
  assert.equal(await p.locator('#title').inputValue(),'Keep global draft');
  assert.equal(await p.locator('#affiliate').inputValue(),'https://s.shopee.co.th/global');
  await p.evaluate(()=>navigateTo('studio',state.stories[0].id));
  await p.locator('#storyHookA').fill('Keep story when pasting a new link');
  await p.locator('#global-query').fill('https://s.shopee.co.th/from-story');await p.locator('#global-query').press('Enter');
  await p.evaluate(()=>navigateTo('studio',state.stories[0].id));
  assert.equal(await p.locator('#storyHookA').inputValue(),'Keep story when pasting a new link');
 });
 await test('sorting puts unknown values last and background preference survives refresh',async p=>{
  const before=await p.evaluate(async()=>{state=demoData();state.products[0].price=null;state.products[1].price=200;state.products[2].price=100;await persist();render();return JSON.stringify(state)});
  await p.locator('#store-sort').selectOption('price');
  assert.equal(await p.locator('.showcase-card').first().locator('h3').innerText(),'กระเป๋าจัดระเบียบสายชาร์จ');
  assert.ok((await p.locator('.showcase-card').last().innerText()).includes('ยังไม่ระบุราคา'));
  await p.locator('[data-lang=en]').click();assert.equal(await p.locator('#store-sort').inputValue(),'price');
  await p.locator('#appearance-toggle').click();assert.equal(await p.locator('#appearance-toggle').getAttribute('aria-pressed'),'true');
  await p.reload();await p.waitForSelector('.store-hero');assert.equal(await p.locator('#appearance-toggle').getAttribute('aria-pressed'),'true');
  assert.equal(await p.evaluate(()=>JSON.stringify(state)),before);
 });
 await test('home search, content status and layout restore without modifying saved records',async p=>{
  const before=await p.evaluate(async()=>{state=demoData();state.products.forEach((p,i)=>p.title='Emerald '+i);state.posts=[];state.stories.forEach(s=>s.ready=false);state.stories[0].ready=true;await persist();render();return JSON.stringify(state)});
  await p.locator('#store-query').fill('Emerald 0');assert.equal(await p.locator('.showcase-card').count(),1);
  await p.locator('[data-action=store-layout][data-layout=list]').click();await p.locator('[data-action=store-status][data-status=ready]').click();
  assert.equal(await p.locator('.showcase-card').count(),1);await p.reload();await p.waitForSelector('.store-hero');
  assert.equal(await p.locator('#store-query').inputValue(),'Emerald 0');assert.equal(await p.locator('.showcase-list .showcase-card').count(),1);
  assert.equal(await p.locator('[data-status=ready]').getAttribute('aria-pressed'),'true');
  await p.locator('[data-lang=en]').click();assert.equal(await p.locator('.showcase-card').count(),1);
  await p.locator('[data-status=published]').click();assert.equal(await p.locator('.showcase-card').count(),0);assert.ok(await p.locator('.filtered-empty').isVisible());
  await p.locator('[data-action=store-clear]').click();assert.equal(await p.locator('.showcase-card').count(),3);
  assert.equal(await p.evaluate(()=>JSON.stringify(state)),before);
 });
 await test('goals and charts use real scheduled tasks and same-age latest observations',async p=>{
  await p.evaluate(async()=>{state=demoData();const tasks=state.plans.flatMap(p=>p.tasks);tasks.forEach((t,i)=>{t.date=i<3?today():dayPlus(today(),2);t.status=i===0?'done':'todo'});await persist();render()});
  assert.equal(await p.locator('[role=meter]').getAttribute('aria-valuetext'),'1/3');
  assert.equal(await p.locator('.daily-checklist li').count(),3);
  assert.equal(await p.locator('.commerce-chart').count(),1);
  await p.locator('#commerce-window').selectOption('7d');assert.equal(await p.locator('.commerce-chart').count(),0);assert.ok(await p.locator('.chart-empty').isVisible());
  assert.ok((await p.locator('.insight-metrics').innerText()).includes('—'));
  assert.equal(await p.evaluate(()=>getComputedStyle(document.body,'::before').content),'none');
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
  for(const width of [320,390,768,1024,1440,1680,1920]){
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
  await p.setViewportSize({width:1536,height:1024});await p.locator('[data-lang=th]').click();
  await p.screenshot({path:path.join(__dirname,'../test-results/storefront-products.png'),fullPage:true});
  await p.screenshot({path:path.join(__dirname,'../test-results/soft-glass-reference-viewport.png'),fullPage:false});
 });
 await browser.close();await new Promise(r=>server.close(r));console.log(passed+' passed, '+failed+' failed');process.exitCode=failed?1:0;
})().catch(e=>{console.error(e);process.exit(1)});
