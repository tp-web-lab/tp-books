import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
const root=new URL('../',import.meta.url);
const pages=JSON.parse(readFileSync(new URL('pages.json',root)));
const base=process.env.BOOK_URL??'http://127.0.0.1:4340/';
const browser=await chromium.launch();
const page=await browser.newPage();
await page.routeWebSocket('**',()=>{});
const results=[];
let errors=[];
page.on('pageerror',error=>errors.push(error.message));
try {
 for(const entry of pages){
  errors=[];
  await page.goto(base+'#/'+entry.file);
  await page.waitForTimeout(3500);
  const result=await page.evaluate(()=>{
   const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
   const raw=[];let node;
   while((node=walk.nextNode())){
    if(!node.parentElement.closest('script,style,pre,code,tp-code-editor,tp-scheme,tp-latex,mjx-container')&&/\\(?:begin|end|addtocontents|hline|def|textit|emph)\b/.test(node.textContent)&&node.parentElement.checkVisibility())raw.push(node.textContent.slice(0,350));
   }
   return {
    raw, mathCount:document.querySelectorAll('mjx-container').length,
    alerts:[...document.querySelectorAll('tp-latex [role=alert]')].map(e=>e.textContent).filter(Boolean),
    mathErrors:[...document.querySelectorAll('mjx-merror,[data-mjx-error]')].map(e=>e.textContent),
    badImages:[...document.images].filter(e=>e.src.includes('/docs/')&&(!e.complete||!e.naturalWidth)).map(e=>e.src)
   };
  });
  const sourceHash=createHash('sha256').update(readFileSync(new URL('public/docs/'+entry.file,root))).digest('hex');
  results.push({page:entry.file,sourceHash,...result,errors});
  console.log(entry.file,result.mathCount,'formulas',result.mathErrors.length+result.alerts.length+result.raw.length+result.badImages.length+errors.length,'issues');
 }
 writeFileSync(new URL('render-verification.json',root),JSON.stringify(results,null,2)+'\n');
 if(results.some(r=>r.raw.length||r.mathErrors.length||r.alerts.length||r.badImages.length||r.errors.length))process.exitCode=1;
} finally {await browser.close();}
