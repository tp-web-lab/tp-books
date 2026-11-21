import {createHash} from 'node:crypto';
import {Worker} from 'node:worker_threads';
import {readFileSync,writeFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const examples=JSON.parse(readFileSync(new URL('examples.json',root)));
const normalize=s=>s.replace(/\s+/g,' ').trim();
function workerTimeout(item){return /count-change|stream-ref/.test(item.query)?30000:5000;}
async function evaluate(item){return new Promise(resolve=>{
 const w=new Worker(new URL('evaluate-worker.mjs',import.meta.url),{workerData:item});
 const timer=setTimeout(()=>{w.terminate();resolve({error:'Execution exceeded the time limit'});},workerTimeout(item));
 w.once('message',r=>{clearTimeout(timer);w.terminate();resolve(r);});
 w.once('error',e=>{clearTimeout(timer);resolve({error:e.message});});
});}
const results=[];
for(let start=0;start<examples.length;start+=4){
 results.push(...await Promise.all(examples.slice(start,start+4).map(async item=>{
 const result=await evaluate(item);
 return {id:item.id,signature:createHash('sha256').update(item.program+'\n'+item.query).digest('hex'),page:item.page,line:item.line,status:result.error?'error':normalize(result.actual)===normalize(item.expected)?'passed':'different',expected:item.expected,...result};
 })));
}
writeFileSync(new URL('verification.json',root),JSON.stringify(results,null,2)+'\n');
console.log(Object.fromEntries(['passed','different','error'].map(s=>[s,results.filter(r=>r.status===s).length])));

await import('./audit.mjs');
