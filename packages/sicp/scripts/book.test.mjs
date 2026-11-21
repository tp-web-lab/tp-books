import test from 'node:test';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {Worker} from 'node:worker_threads';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const pages=JSON.parse(read('pages.json')),examples=JSON.parse(read('examples.json'));
test('Every level-one and level-two section has a page and navigation entry',()=>{
 assert.equal(pages.length,[...read('source/sicp-canonical.md').matchAll(/^#{1,2} .+$/gm)].length);
 for(const p of pages){assert.ok(existsSync(new URL(`public/docs/${p.file}`,root)));assert.ok(read('public/docs/sidebar.md').includes(`](${p.file})`));}
});
test('Every detected example is editable in simple mode and retains the expected output',()=>{
 for(const e of examples){const text=read(`public/docs/${e.page}`);assert.ok(text.includes(`mode="simple" id="${e.id}"`),e.id);assert.ok(text.includes(e.expected),e.id);assert.ok(e.query.trim());}
 assert.equal(new Set(examples.map(e=>e.id)).size,examples.length);
});
test('Adjacent size queries share definitions and execution order',()=>{
 const e=examples.find(e=>e.expected==='2\n10');assert.equal(e.pairs,2);assert.match(e.program,/\(define size 2\)/);assert.equal(e.expected,'2\n10');assert.ok(e.program.indexOf('result size')<e.program.indexOf('(* 5 size)'));
});
for(const id of ['example-001','example-004','example-008','example-013','example-019','example-022']){
 test(`${id}: actual isolated Scheme execution`,{timeout:20000},async()=>{
  const e=examples.find(e=>e.id===id);
  const result=await new Promise((resolve,reject)=>{
   const w=new Worker(new URL('evaluate-worker.mjs',import.meta.url),{workerData:e});
   const timer=setTimeout(()=>{w.terminate();reject(Error('Execution timeout'));},15000);
   w.once('message',r=>{clearTimeout(timer);w.terminate();resolve(r);});
   w.once('error',error=>{clearTimeout(timer);reject(error);});
  });
  assert.equal(result.error,undefined);assert.equal(result.actual.replace(/\s+/g,' ').trim(),e.expected.replace(/\s+/g,' ').trim());
 });
}
test('Audit covers every interpreter, including failures and differences',()=>{
 const results=JSON.parse(read('verification.json'));
 assert.deepEqual(results.map(r=>r.id),examples.map(e=>e.id));
 const audit=read('public/docs/audit.md');for(const r of results)assert.ok(audit.includes(`[${r.id}]`));
});

test('All local book illustrations exist',()=>{
 const assets=JSON.parse(read('source/assets.json'));
 for(const path of assets)assert.ok(existsSync(new URL('public/docs/'+path,root)),path);
});
test('Scheme-specific prose is retained, including the naming explanation',()=>{
 const text=read('source/sicp-canonical.md');
 assert.match(text,/computational objects/);
 assert.match(text,/identifies a \*variable\*/);
 assert.equal([...text.matchAll(/^\*\*Exercise [0-9.]+\*\*/gm)].length,357);
});

test('The original PDF is unchanged',()=>{
 const expected=JSON.parse(read('source/reference.json')).sha256;
 const actual=createHash('sha256').update(readFileSync(new URL('public/original/sicp.pdf',root))).digest('hex');
 assert.equal(actual,expected);
});
test('Every original note retains its number and local target',()=>{
 let count=0;
 for(const page of pages){
  const text=read('public/docs/'+page.file);
  for(const match of text.matchAll(/<sup><a href="#(note-\d+-(\d+))">(\d+)<\/a><\/sup>/g)){
   assert.equal(match[2],match[3]);
   assert.ok(text.includes('id="'+match[1]+'"'),match[1]);
   count++;
  }
 }
 assert.equal(count,338);
});
