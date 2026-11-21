import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {join,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {DOMParser} from '@xmldom/xmldom';
import {recursiveProcessTextMarkdown,resetMarkdownCounters,finalizeMarkdown,labelMap,takeFootnotes,extractCode} from './upstream/parseXmlMarkdown.js';
const root=fileURLToPath(new URL('../',import.meta.url)),xml=join(root,'source/upstream/xml');
function walk(dir){const entries=readdirSync(dir,{withFileTypes:true});const parent=`${basename(dir)}.xml`;return entries.sort((a,b)=>a.name===parent?-1:b.name===parent?1:a.name.localeCompare(b.name,'en',{numeric:true})).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):e.name.endsWith('.xml')?[join(dir,e.name)]:[]);}
const files=['02foreword84.xml','03prefaces96.xml','04acknowledgements04.xml'].map(p=>join(xml,'others',p));
for(let i=1;i<=5;i++)files.push(...walk(join(xml,`chapter${i}`)));
files.push(join(xml,'others/97references97.xml'));
const docs=files.map(file=>{
 const data=readFileSync(file,'utf8').replace(/&(?!amp;|lt;|gt;|quot;|apos;|#)[\w.]+;/g,'');
 return {file,doc:new DOMParser().parseFromString(data,'text/xml')};
});
labelMap.clear();resetMarkdownCounters();
for(const {doc} of docs)recursiveProcessTextMarkdown(doc.documentElement,[]);
resetMarkdownCounters();const content=[];
for(const {file,doc} of docs){const output=[];recursiveProcessTextMarkdown(doc.documentElement,output);content.push(finalizeMarkdown(output.join(''))+'\n\n'+takeFootnotes());}
writeFileSync(join(root,'source/sicp-canonical.md'),content.join('\n').replace(/\n{3,}/g,'\n\n').trim()+'\n');
console.log('Canonical Scheme text generated from',files.length,'XML files.');

const snippets=[];
for(const {file,doc} of docs){for(const snippet of Array.from(doc.getElementsByTagName('SNIPPET'))){
 const direct=tag=>Array.from(snippet.childNodes).filter(n=>n.nodeName===tag);
 const code=extractCode(snippet.getElementsByTagName('SCHEME')[0]);
 const name=direct('NAME')[0]?.textContent.trim();
 if(!code)continue;
 let excluded=false;for(let n=snippet.parentNode;n;n=n.parentNode)if(['JAVASCRIPT','SOLUTION','WEB_ONLY'].includes(n.nodeName))excluded=true;
 snippets.push({name:name??null,code,requires:direct('REQUIRES').map(n=>n.textContent.trim()),file:file.slice(xml.length+1),excluded});
}}
writeFileSync(join(root,'source/snippets.json'),JSON.stringify(snippets,null,2)+'\n');
