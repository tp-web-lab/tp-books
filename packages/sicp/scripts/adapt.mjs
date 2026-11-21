import {adaptExecution} from './execution-adaptations.mjs';
import {mathMarkup} from './math-markup.mjs';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url));
export const source=readFileSync(`${root}source/sicp-canonical.md`,'utf8');
export function forms(code) {
 const out=[]; let start=-1,depth=0,string=false,escape=false,comment=false;
 for(let i=0;i<code.length;i++){
  const c=code[i];
  if(comment){if(c==='\n')comment=false;continue;}
  if(string){if(escape)escape=false;else if(c==='\\')escape=true;else if(c==='"')string=false;continue;}
  if(c===';'){comment=true;continue;}
  if(start<0){if(/\s/.test(c))continue;start=i;}
  if(c==='"')string=true;
  else if(c==='(')depth++;
  else if(c===')'){depth--;if(depth<0)throw Error('Unbalanced parentheses');}
  if(depth===0 && !string && (c===')'||i===code.length-1||/\s/.test(code[i+1]))){out.push(code.slice(start,i+1));start=-1;}
 }
 if(depth||string)throw Error('Incomplete Scheme expression');
 return out;
}
const blocks=[...source.matchAll(/^```([^\n]*)\n([\s\S]*?)^```[ \t]*$/gm)].map((m,i)=>({id:i,start:m.index,end:m.index+m[0].length,kind:m[1].trim(),code:m[2].trim(),line:source.slice(0,m.index).split('\n').length}));
const definitionName=s=>s.match(/^\(define\s+(?:\(\s*)?([^\s()]+)/)?.[1];
const definitions=[];
for(const b of blocks){try{for(const code of forms(b.code)){const name=definitionName(code);if(name)definitions.push({...b,name,code});}}catch{}}
const officialSnippets=JSON.parse(readFileSync(`${root}source/snippets.json`,'utf8'));
const normalizeCode=s=>s.replace(/\s+/g,' ').trim();
const recovered=JSON.parse(readFileSync(`${root}source/pdf-definitions.json`,'utf8'));
const names=new Set(definitions.map(x=>x.name));
const tokens=code=>(code.replace(/;[^\n]*/g,'').replace(/"(?:\\.|[^"\\])*"/g,'').match(/[^\s()'`,]+/g)||[]);
// The source has unlabelled output blocks. Only pair adjacent input/output,
// never execute a known output again as the following query.
const pairs=[];
for(let i=0;i<blocks.length-1;i++){
 const a=blocks[i],b=blocks[i+1];
 if(a.kind!=='scheme'||b.kind!=='text'||source.slice(a.end,b.start).trim())continue;
 try {if(!forms(a.code).length)continue;}catch{continue;}
 pairs.push({input:a,result:b});i++;
}
const groups=[];
for(const pair of pairs){const prev=groups.at(-1);if(prev&&!source.slice(prev.at(-1).result.end,pair.input.start).trim())prev.push(pair);else groups.push([pair]);}
// Primitive reimplementations are local teaching experiments, not global overrides.
const primitive=new Set('and or else if cond begin define define-syntax syntax-rules lambda let let* letrec set! quote quasiquote unquote delay force do case + - * / = < > <= >= cons car cdr set-car! set-cdr! list map length append reverse list-ref for-each abs remainder modulo expt gcd read display newline write not equal? eq? eqv? apply eval'.split(' '));
const aliases={
 'cons-stream': '(define-syntax cons-stream (syntax-rules () ((_ head tail) (cons head (delay tail)))))',
 'stream-car':'(define (stream-car s) (car s))',
 'stream-cdr':'(define (stream-cdr s) (force (cdr s)))',
 'stream-null?':'(define (stream-null? s) (null? s))',
 'the-empty-stream':"(define the-empty-stream '())",
nil:"(define nil '())",true:'(define true #t)',false:'(define false #f)',inc:'(define (inc x) (+ x 1))',dec:'(define (dec x) (- x 1))',runtime:'(define (runtime) (Date.now))'};
function ast(code){
 const ts=code.match(/;[^\n]*|"(?:\\.|[^"\\])*"|[()'`,]|[^\s()'`,]+/g)?.filter(t=>!t.startsWith(';'))||[];
 let i=0;
 function read(){const t=ts[i++];if(t==='('){const a=[];while(i<ts.length&&ts[i]!==')')a.push(read());if(ts[i++]!==')')throw Error('Incomplete expression');return a;}if(t==="'")return ['quote',read()];if(t==='`')return ['quasiquote',read()];return t;}
 const result=[];while(i<ts.length)result.push(read());return result;
}
function free(code){
 const result=new Set();
 function walk(x,bound=new Set()){
  if(!Array.isArray(x)){if(typeof x==='string'&&!bound.has(x)&&!/^[-+]?([0-9]|\.[0-9])|^["#]/.test(x))result.add(x);return;}
  const [op,...rest]=x;
  if(op==='quote'||op==='quasiquote')return;
  if(op==='define'){
   const [name,...body]=rest;const b=new Set(bound);
   if(Array.isArray(name)){for(const n of name)b.add(n);}else b.add(name);
   for(const expr of body)if(Array.isArray(expr)&&expr[0]==='define')b.add(Array.isArray(expr[1])?expr[1][0]:expr[1]);
   for(const expr of body)walk(expr,b);return;
  }
  if(op==='lambda'){
   const b=new Set(bound);for(const n of Array.isArray(rest[0])?rest[0]:[rest[0]])b.add(n);
   for(const expr of rest.slice(1))walk(expr,b);return;
  }
  if(['let','let*','letrec'].includes(op)){
   const b=new Set(bound);let bindings=rest[0],body=rest.slice(1);
   if(typeof bindings==='string'){b.add(bindings);bindings=rest[1];body=rest.slice(2);}
   for(const pair of bindings||[]){if(Array.isArray(pair)){walk(pair[1],op==='let'?bound:b);b.add(pair[0]);}}
   for(const expr of body)if(Array.isArray(expr)&&expr[0]==='define')b.add(Array.isArray(expr[1])?expr[1][0]:expr[1]);
   for(const expr of body)walk(expr,b);return;
  }
  const b=new Set(bound);
  for(const e of x)if(Array.isArray(e)&&e[0]==='define')b.add(Array.isArray(e[1])?e[1][0]:e[1]);
  for(const e of x)walk(e,b);
 }
 for(const tree of ast(code))walk(tree);
 return result;
}
function program(group){
 const position=group[0].input.start;const selected=new Map();const visiting=new Set();
 const local=group.flatMap(p=>forms(p.input.code)).filter(definitionName);
 const locals=new Set(local.map(definitionName));
 function visit(name){
  if(visiting.has(name)||selected.has(name)||locals.has(name)||primitive.has(name))return;
  const eligible=definitions.filter(d=>d.name===name&&!/\?\?|\.\.\./.test(d.code));
  const section=[...source.slice(0,position).matchAll(/^#{1,2} .+$/gm)].at(-1)?.index??0;
  const end=source.slice(position).search(/^#{1,2} .+$/m);
  const same=eligible.filter(d=>d.start>=section&&d.start<(end<0?source.length:position+end));
  const d=same.filter(d=>d.start<position).at(-1)??same.find(d=>d.start>=position)??eligible.filter(d=>d.start<position).at(-1);
  if(!d){
   if(aliases[name])selected.set(name,{code:aliases[name]});
   else {const pdf=recovered.find(d=>d.name===name);if(pdf){visiting.add(name);for(const dep of free(pdf.code))visit(dep);selected.set(name,{code:`; Restored from the supplied PDF, page ${pdf.page}.\n${pdf.code}`});visiting.delete(name);}}
   return;
  }
  visiting.add(name);
  for(const dep of free(d.code))visit(dep);
  selected.set(name,d);visiting.delete(name);
 }
 for(const p of group)for(const token of free(p.input.code))visit(token);
 for(const d of local)for(const token of free(d))visit(token);
 const official=[];const seen=new Set();
 function include(name){if(seen.has(name))return;seen.add(name);const snippet=officialSnippets.find(s=>s.name===name&&!s.excluded);if(!snippet)return;for(const dep of snippet.requires)include(dep);official.push(snippet.code);}
 for(const pair of group.slice(0,1)){const snippet=officialSnippets.find(s=>!s.excluded&&normalizeCode(s.code)===normalizeCode(pair.input.code));if(snippet)for(const name of snippet.requires)include(name);}
 for(const code of official)for(const name of free(code))visit(name);
 return [...[...selected.values()].map(d=>d.code),...official,...local].filter((code,i,all)=>all.indexOf(code)===i).join('\n\n');
}
const headings=[...source.matchAll(/^(#{1,2}) (.+)$/gm)];
const slug=s=>s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const pages=headings.map((m,i)=>({title:m[2],level:m[1].length,start:m.index,end:headings[i+1]?.index??source.length,file:`${String(i+1).padStart(2,'0')}-${slug(m[2])}.md`}));
const attr=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\n','&#10;');
mkdirSync(`${root}public/docs`,{recursive:true});
const corrections=[];
const pdfSections=JSON.parse(readFileSync(`${root}source/pdf-sections.json`,'utf8'));
const manifest=[];
for(const page of pages){
 let text=source.slice(page.start,page.end);
 const items=groups.filter(g=>g[0].input.start>=page.start&&g.at(-1).result.end<=page.end);
 for(const group of items.toReversed()){
  const id=`example-${String(groups.indexOf(group)+1).padStart(3,'0')}`;
  let code=program(group);
  const queries=group.flatMap(p=>forms(p.input.code).filter(x=>!definitionName(x)));
  let q=queries.length===1?queries[0]:`(begin\n${queries.slice(0,-1).map(x=>`  (let ((result ${x})) (if (not (eq? result #void)) (begin (write result) (newline))))`).join('\n')}\n  ${queries.at(-1)}\n)`;
  if(q.includes('\n') || (q.includes("'")&&q.includes('"'))){code+='\n\n; Run the successive queries in the order shown in the book.\n(define (run-example)\n  '+q+'\n)';q='(run-example)';}
  let queryAttribute=q.includes('"')?`'${q}'`:`"${q}"`;
  const expected=group.map(p=>p.result.code).join('\n');
  const context=[...source.slice(page.start,group[0].input.start).matchAll(/^(?:#{3,} .+|\*\*Exercise ([0-9.]+)\*\*)/gm)].at(-1);
  const exercise=context?.[1]?.replace(/\.$/,'')??null;
  const item={id,exercise,page:page.file,line:group[0].input.line,program:code,query:q,expected,pairs:group.length};
  adaptExecution(item,{definitions,forms,group});code=item.program;q=item.query;
  if(q.includes("\n")||(q.includes("\"")&&q.includes("'"))){code+="\n(define (run-adapted-example) "+q+")";q="(run-adapted-example)";item.program=code;item.query=q;}
  queryAttribute=q.includes("\"")?`'${q}'`:`"${q}"`;manifest.unshift(item);
  const replacement=`::: tp-scheme {mode="simple" id="${id}" filename="${id}.scm" query=${queryAttribute}}\n:::: script {type="tp/scheme"}\n${code}\n::::\n:::\n\n<details>\n<summary>Expected result in the source</summary>\n\n\`\`\`text\n${expected}\n\`\`\`\n\n</details>`;
  text=text.slice(0,group[0].input.start-page.start)+replacement+text.slice(group.at(-1).result.end-page.start);
 }
 for(const c of corrections)text=text.replace(c.before,c.after);
 // Keep the printed chapter-local note numbers when splitting the book.
 text=text.replace(/^\[\^(\d+)-(\d+)\]: ([^\n]*(?:\n(?:    [^\n]*|(?=\n    )[^\n]*))*)/gm,(_all,chapter,number,body)=>
  `::::: aside {id="note-${chapter}-${number}"}\n**${number}.** ${body.replace(/^    /gm,'').trim()}\n:::::`);
 text=text.replace(/\[\^(\d+)-(\d+)\]/g,(_all,chapter,number)=>`<sup><a href="#note-${chapter}-${number}">${number}</a></sup>`);
 text=mathMarkup(text);
 text=text.replaceAll("https://sicp.sourceacademy.org/", "docs/");
 const pdf=pdfSections.find(p=>p.heading===page.title);
 if(pdf)text=text.replace(/^(#+ .+)$/m,`$1\n\n[Original PDF · page ${pdf.pdfPage}](original/sicp.pdf#page=${pdf.pdfPage})`);
 page.title=corrections.find(c=>c.before===`${'#'.repeat(page.level)} ${page.title}`)?.after.replace(/^#+ /,'')??page.title;
 writeFileSync(`${root}public/docs/${page.file}`,'---\nmath: latexmath\n---\n\n'+text.trim()+'\n');
}
manifest.sort((a,b)=>a.line-b.line);
writeFileSync(`${root}public/docs/sidebar.md`,'- [Introduction](cover.md)\n'+pages.map(p=>`${p.level===2?'  ':''}- [${p.title}](${p.file})`).join('\n')+'\n- [Adaptation audit](audit.md)\n- [Text conformity](text-conformity.md)\n');
writeFileSync(`${root}examples.json`,JSON.stringify(manifest,null,2)+'\n');
writeFileSync(`${root}pages.json`,JSON.stringify(pages,null,2)+'\n');
writeFileSync(`${root}public/docs/cover.md`, `# Structure and Interpretation of Computer Programs

Harold Abelson and Gerald Jay Sussman, with Julie Sussman.

## The original Scheme text

This interactive edition follows the **Scheme Edition PDF supplied for this project**. Its ${pages.length} reading pages cover the foreword, prefaces, acknowledgments, five chapters and references, split at level-one and level-two headings. Deeper headings remain within their section.

The initially supplied Markdown was incomplete: its exporter discarded Scheme-specific prose and programs. It is retained unchanged for provenance, but is **not the text used by this edition**. The reading text is regenerated from the original XML sources, retaining Scheme and PDF-only content, the original exercises, notes, formulas and figures. The upstream revision is recorded in source/upstream.json. Each section links to its corresponding PDF page. Unresolved references printed as “??” in the PDF are retained as such; they are not silently rewritten.

[Open the complete original PDF](original/sicp.pdf), including the title pages and the original printed index. [Open the original index](original/sicp.pdf#page=583).

## Interactive additions

Examples with printed results use **tp-scheme in simple mode**, powered by LIPS. Press **Return** in the query field to execute; **Shift+Return** is equivalent. Edited source is reloaded before the query and displays **> Program reloaded.**. Consecutive queries share one interpreter. Dependencies are included in the editable source so that a section can be opened directly. Nothing runs automatically.

The book’s printed result is retained beneath each example. The editable program may include support definitions or a run-example procedure to execute several queries in order; these are TP presentation adaptations, not changes to the authors’ prose. Some interactive exercises include editable TP reference implementations, clearly identified next to the cell. Advanced transcripts include their evaluator or register-machine support; the [execution audit](audit.md) records results, numerical equivalences, intentional errors, adaptations and any unresolved cases. Text fidelity and execution compatibility are separate checks. See the [text conformity audit](text-conformity.md) for the comparison of all reading sections and the documented corrections to defects in the PDF.

## Attribution

The original text is by Harold Abelson and Gerald Jay Sussman, with Julie Sussman. The source archive is maintained by Source Academy. Figures credit Andres Raba, Martin Henz and Tobias Wrigstad. The supplied PDF’s copyright page (page 4) specifies CC BY-NC-SA 4.0 for the publication, CC BY-SA 4.0 for the underlying text and figures, and GPLv3 for Scheme programs. Those notices apply to the retained material; TP adaptations are identified separately. See NOTICE.md in the repository for links and attribution.
`);
console.log(`${pages.length} pages; ${pairs.length} query/result pairs grouped into ${manifest.length} interpreters.`);
