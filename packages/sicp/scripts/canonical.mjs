import {createHash} from 'node:crypto';
import {linkUnmarkedCitations,restoredBibliography} from './bibliography-links.mjs';
import {readFileSync,writeFileSync,readdirSync,mkdirSync} from 'node:fs';
import {join,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {DOMParser} from '@xmldom/xmldom';
import {recursiveProcessTextMarkdown,resetMarkdownCounters,finalizeMarkdown,labelMap,takeFootnotes,extractCode,enableBibliographyLinks,bibliographyEntries,bibliographyCitations} from './upstream/parseXmlMarkdown.js';
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

// A second rendering adds semantic citation markup without modifying the
// canonical text used for the independent PDF conformity audit.
enableBibliographyLinks(true);resetMarkdownCounters();
const linked=[];
for(const {doc} of docs){const output=[];recursiveProcessTextMarkdown(doc.documentElement,output);linked.push(finalizeMarkdown(output.join(''))+'\n\n'+takeFootnotes());}
mkdirSync(join(root,'.generated'),{recursive:true});

// Some citations in the Scheme PDF point to updated editions whose notices
// are only present in the XML JavaScript branch. Add those exact notices,
// identify the supplement, and keep the PDF's citation wording unchanged.
for(const key of new Set(bibliographyCitations.map(c=>c.key))){
 if(bibliographyEntries.some(e=>e.key===key))continue;
 const definition=docs.flatMap(({doc})=>Array.from(doc.getElementsByTagName('REFERENCE'))).find(n=>n.getAttribute('NAME')===key);
 if(!definition)throw Error('Citation has no source bibliography entry: '+key);
 recursiveProcessTextMarkdown(definition.cloneNode(true),[]);
 const entry=bibliographyEntries.at(-1);
 entry.supplemental=true;
 entry.provenance='Exact notice from the original XML, omitted by its Scheme bibliography branch but cited in the supplied PDF.';
}
for(const [key,author,year] of [['EDW19','Edwards','2019'],['KNU97A','Knuth','1997a']]){
 const definition=docs.flatMap(({doc})=>Array.from(doc.getElementsByTagName('REFERENCE'))).find(n=>n.textContent.trim().startsWith(author)&&n.textContent.includes(year));
 if(!definition)throw Error('Missing original XML notice '+key);
 const clone=definition.cloneNode(true);clone.setAttribute('NAME',key);
 recursiveProcessTextMarkdown(clone,[]);
 Object.assign(bibliographyEntries.at(-1),{supplemental:true,provenance:'Exact notice from the original XML, omitted by its Scheme bibliography branch but cited in the supplied PDF.'});
}
bibliographyEntries.push(...restoredBibliography);
const linkedResult=linkUnmarkedCitations(linked.join('\n').replace(/\n{3,}/g,'\n\n').trim()+'\n',bibliographyEntries);
bibliographyCitations.push(...linkedResult.citations);
writeFileSync(join(root,'.generated/sicp-linked.md'),linkedResult.markdown);
const textHash=value=>createHash('sha256').update(value.replace(/\s+/g,' ').trim()).digest('hex');
const canonicalTextSha256=textHash(readFileSync(join(root,'source/sicp-canonical.md'),'utf8'));
const plainLinked=linkedResult.markdown.replace(/:tp-ref:\{href="@[^"]+" label="([^"]*)"\}/g,(_,label)=>label.replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&'));
const linkedTextSha256=textHash(plainLinked);
if(canonicalTextSha256!==linkedTextSha256)throw Error('Citation markup changed the original reading text');
writeFileSync(join(root,'bibliography.json'),JSON.stringify({canonicalTextSha256,linkedTextSha256,entries:bibliographyEntries,citations:bibliographyCitations},null,2)+'\n');
enableBibliographyLinks(false);
