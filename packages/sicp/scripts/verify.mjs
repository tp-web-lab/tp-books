import {compareResult} from './compare-results.mjs';
import {createHash} from 'node:crypto';
import {Worker} from 'node:worker_threads';
import {readFileSync,writeFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const examples=JSON.parse(readFileSync(new URL('examples.json',root)));
function workerTimeout(item){return item.timeout ?? (/count-change|stream-ref/.test(item.query)?120000:60000);}
async function evaluate(item){return new Promise(resolve=>{
 const w=new Worker(new URL('evaluate-worker.mjs',import.meta.url),{workerData:item});
 const timer=setTimeout(()=>{w.terminate();resolve({error:'Execution exceeded the time limit'});},workerTimeout(item));
 w.once('message',r=>{clearTimeout(timer);w.terminate();resolve(r);});
 w.once('error',e=>{clearTimeout(timer);resolve({error:e.message});});
});}
const requested=process.env.SICP_IDS?.split(',');
const results=[];
const previous=JSON.parse(readFileSync(new URL('verification.json',root)));

for(let start=0;start<examples.length;start+=2){
 results.push(...await Promise.all(examples.slice(start,start+2).map(async item=>{
 if(requested&&!requested.includes(item.id))return previous.find(r=>r.id===item.id);
 const result=await evaluate(item);
 console.log(item.id, compareResult(item,result).status, result.error??String(result.actual).slice(0,90));
 return {id:item.id,signature:createHash('sha256').update(item.program+'\n'+item.query).digest('hex'),page:item.page,line:item.line,...compareResult(item,result),expected:item.expected,...result};
 })));
}
writeFileSync(new URL('verification.json',root),JSON.stringify(results,null,2)+'\n');
console.log(Object.fromEntries(['passed','equivalent','exercise-result','expected-error','different','error'].map(s=>[s,results.filter(r=>r.status===s).length])));

await import('./audit.mjs');
