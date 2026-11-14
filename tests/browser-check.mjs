import assert from 'node:assert/strict';
import{spawn}from'node:child_process';
import{chromium}from'playwright';
const origin='http://127.0.0.1:4174';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4174','--strictPort'],{stdio:'inherit'});
async function ready(){
 for(let i=0;i<80;i++){
  try{const r=await fetch(origin);if(r.ok)return;}
  catch(_){}
  await new Promise(resolve=>setTimeout(resolve,250));
 }
 throw Error('Vite preview server did not start');
}
let browser;
try{
 await ready();
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--disable-dev-shm-usage']});
 for(const width of [360,390,768,1365]){
  const page=await browser.newPage({viewport:{width,height:800},deviceScaleFactor:1,isMobile:width<500,hasTouch:width<500});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const r=await page.goto(origin,{waitUntil:'domcontentloaded'});
  assert.equal(r.status(),200);
  await page.locator('.hero-copy h1').waitFor();
  assert.match(await page.title(),/Sanctum Chess Football/);
  assert.equal(await page.locator('a[href="https://sanctum-chess-football.pages.dev/"]').count()>0,true,'Play now links');
  await page.waitForTimeout(1200);
  const visible=await page.evaluate(()=>!!document.querySelector('canvas')||!!document.querySelector('.scene-fallback'));
  assert.ok(visible,'3D canvas or progressive fallback is visible');
  const jump=async n=>{
   await page.evaluate(index=>{
    const j=document.getElementById('journey'),height=j.offsetHeight-innerHeight;
    scrollTo({top:scrollY+j.getBoundingClientRect().top+height*index/6,behavior:'instant'});
   },n);
   await page.waitForTimeout(450);
  };
  await jump(2.5);
  assert.ok((await page.locator('.chapter-copy h2').textContent()).trim().length>4);
  await jump(5.8);
  assert.ok(await page.locator('.ending-copy').count()===1);
  await jump(0);
  assert.ok(await page.locator('.hero-copy').evaluate(e=>e.classList.contains('visible')),'reverse scrolling returns to hero');
  await page.locator('a[href="/base.apk"]').first().waitFor({state:'attached'});
  const apk=await page.request.get(origin+'/base.apk');
  assert.equal(apk.status(),200,'APK downloadable');
  assert.equal((await apk.body()).byteLength,195273,'APK length');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(overflow<=4,'no horizontal overflow at '+width+'px: '+overflow);
  assert.deepEqual(errors,[],'no JavaScript errors at '+width+'px');
  console.log('PASS '+width+'px : 3D, reverse scroll, Play Now, APK, responsive viewport');
  await page.close();
 }
 const reduced=await browser.newPage({viewport:{width:390,height:800},reducedMotion:'reduce'});
 await reduced.goto(origin);await reduced.waitForTimeout(400);
 assert.ok(await reduced.locator('.hero-copy').count()===1);
 await reduced.close();
 console.log('PASS reduced-motion browser mode');
}catch(e){console.error(e);process.exitCode=1}
finally{await browser?.close();server.kill();}
