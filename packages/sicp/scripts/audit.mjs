import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name,root)));
const examples=read('examples.json'),results=read('verification.json');
for(const r of results){const e=examples.find(e=>e.id===r.id);if(r.signature!==createHash('sha256').update(e.program+'\n'+e.query).digest('hex')){r.status='unverified';r.error='Program changed since verification';}}
const escape=s=>String(s).replaceAll('|','\\|').replaceAll('\n','<br>');
const counts=Object.fromEntries(['passed','different','error','unverified'].map(status=>[status,results.filter(r=>r.status===status).length]));
const text=`# Adaptation and execution audit

## Scope

The 33 source sections (headings # and ##) are preserved as individual pages. This edition currently identifies ${examples.reduce((n,e)=>n+e.pairs,0)} adjacent input/result pairs and groups them into ${examples.length} interpreters. This count is **not** a claim that every code block in the book is executable or that automatic detection finds all examples. Ordinary definitions, derivation steps, syntax templates and unfinished exercises remain in their original context.

## Measured results

Tests use LIPS 1.0.0-beta.23.1, the same version as tp-scheme. Each example runs in an isolated worker. The test records the actual output; the original expected result is never substituted for it.

| Exact output match | Different output | Execution error or time limit |
| ---: | ---: | ---: |
| ${counts.passed} | ${counts.different} | ${counts.error} |

Differences include numeric formatting, alternative definitions, state mutations and deliberate exercise bugs. An exercise may correctly remain incomplete: its expected output specifies the goal, not a supplied solution. Chapters 4 and 5 include embedded languages and evaluator/VM transcripts that are not directly executable as ordinary LIPS queries. These are unresolved adaptations, not passing demonstrations.

Unverified after editing: ${counts.unverified}.

## Text conformity

All 33 reading sections have been compared with the supplied PDF. See the [section-by-section text conformity audit](text-conformity.md) for the method, corrections, authorized exceptions and limits. Execution failures above remain independent of that check.

## Source recovery

The initially supplied Markdown is preserved unchanged for provenance, but is not used as the reading text: its exporter omitted Scheme-specific passages. The reading text is regenerated from the original XML at the revision recorded in source/upstream.json, selecting Scheme and PDF-only content. It includes 357 exercises, 338 notes and 95 figure captions. The 620-page original PDF is included, identified by SHA-256 in source/reference.json, and linked from every section. Its title pages and printed index remain available in that PDF.

Text recovery and interpreter compatibility are separate checks. Original prose and printed results are retained; added dependency programs and verification notices are editorial additions. The detailed text conformity report records comparisons against the PDF itself, not only the XML revision. Formula layout, page breaks and typography can differ in the web presentation. Global names can denote different procedures in different sections; the dependency resolver still needs review for the failing examples.

## Interactive examples

| Example | Context | Result | Detail |
| --- | --- | --- | --- |
${results.map(r=>{const e=examples.find(e=>e.id===r.id);return `| [${r.id}](${r.page}#${r.id}) | ${e.exercise?`Exercise ${e.exercise}`:'Demonstration / transcript'} | ${r.status} | ${escape(r.error??(r.status==='different'?`Expected: ${r.expected}\nActual: ${r.actual}`:'Matches the supplied result'))} |`;}).join('\n')}

## Reproduce

Run pnpm adapt, then node packages/sicp/scripts/verify.mjs and node packages/sicp/scripts/audit.mjs from the repository root. verification.json contains the complete actual and expected outputs. No browser execution is triggered when a page opens.
`;
writeFileSync(new URL('public/docs/audit.md',root),text);
// Add an explicit notice to examples that are not verified, without hiding the interpreter.
for(const page of new Set(examples.map(e=>e.page))){
 const path=new URL(`public/docs/${page}`,root);let source=readFileSync(path,'utf8');
 source=source.replace(/<!-- verification:[\s\S]*?<!-- \/verification -->\n\n/g,'');
 for(const r of results.filter(r=>r.page===page&&r.status!=='passed')){
  const e=examples.find(e=>e.id===r.id);
  const note=e.exercise?`**Exercise ${e.exercise}:** the source is editable. The supplied program does not yet reproduce the expected result; complete or correct it using the exercise instructions.`:r.status==='different'?'**Output comparison:** the current LIPS output differs from the printed result.':'**Adaptation pending:** this transcript needs additional setup or an embedded evaluator; it is not yet a verified LIPS demonstration.';
  const marker=`::: tp-scheme {mode="simple" id="${r.id}"`;
  source=source.replace(marker,`<!-- verification:${r.id} -->\n${note} [Verification details](audit.md).\n<!-- /verification -->\n\n${marker}`);
 }
 writeFileSync(path,source);
}
console.log(counts);

await import("./text-audit.mjs");
