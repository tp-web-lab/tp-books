import fs from 'node:fs';
if(!process.argv[2])throw Error('Pass a UTF-8 PDF text extract with form-feed PDF PAGE N markers (see README).');
const raw=fs.readFileSync(process.argv[2],'utf8').replaceAll('\u0000','').replaceAll('−','-').replaceAll('’',"'").replaceAll('ﬁ','fi').replaceAll('ﬂ','fl');
const result=[];
for(const page of raw.split(/\fPDF PAGE /).slice(1)){
 const number=Number(page.match(/^\d+/)[0]);
 for(const m of page.matchAll(/^\(define\s+(?:\(\s*)?([^\s()]+)/gm)){
  let depth=0,string=false,comment=false,end=m.index;
  for(;end<page.length;end++){
   const c=page[end];if(comment){if(c==='\n')comment=false;continue;}if(c==='"'&&page[end-1]!=='\\')string=!string;if(string)continue;if(c===';'){comment=true;continue;}if(c==='(')depth++;if(c===')')depth--;if(!depth){end++;break;}
  }
  if(depth===0){const code=page.slice(m.index,end);if(!/⟨|⟩|\?\?|\.\.\./.test(code))result.push({name:m[1],page:number,code});}
 }
}
fs.writeFileSync(new URL('../source/pdf-definitions.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(result.length);
