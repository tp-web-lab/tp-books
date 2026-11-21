import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name,root)));
const examples=read('examples.json'),results=read('verification.json');
for(const r of results){const e=examples.find(e=>e.id===r.id);if(r.signature!==createHash('sha256').update(e.program+'\n'+e.query).digest('hex')){r.status='unverified';r.error='Program changed since verification';}}
const escape=s=>String(s).replaceAll('|','\\|').replaceAll('\n','<br>');
const counts=Object.fromEntries(['passed','equivalent','exercise-result','expected-error','different','error','unverified'].map(status=>[status,results.filter(r=>r.status===status).length]));
const browser=existsSync(new URL('browser-verification.json',root))?read('browser-verification.json'):[];
const browserCurrent=browser.filter(r=>{const e=examples.find(e=>e.id===r.id);return e&&r.signature===createHash('sha256').update(e.program+'\n'+e.query).digest('hex');});
const browserCounts=Object.fromEntries(['passed','equivalent','exercise-result','expected-error','different','error'].map(status=>[status,browserCurrent.filter(r=>r.status===status).length]));
const bibliography=read('bibliography.json');
const bibliographyCheck=existsSync(new URL('bibliography-verification.json',root))?read('bibliography-verification.json'):null;
const text=`# Adaptation and execution audit

## Scope

The 33 source sections (headings # and ##) are preserved as individual pages. This edition currently identifies ${examples.reduce((n,e)=>n+e.pairs,0)} adjacent input/result pairs and groups them into ${examples.length} interpreters. This count is **not** a claim that every code block in the book is executable or that automatic detection finds all examples. Ordinary definitions, derivation steps, syntax templates and unfinished exercises remain in their original context.

## Measured results

Tests use LIPS 1.0.0-beta.23.1, the same version as tp-scheme. Each example runs in an isolated worker. The test records the actual output; the original expected result is never substituted for it.

| Matches (whitespace ignored) | Equivalent values / printing | Exercise answers | Intentional error | Different output | Unexpected error / timeout | Not verified after editing |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| ${counts.passed} | ${counts.equivalent} | ${counts['exercise-result']} | ${counts['expected-error']} | ${counts.different} | ${counts.error} | ${counts.unverified} |

Scheme whitespace and equivalent quote spellings are normalized. Numeric comparisons allow the book’s printed precision plus floating-point roundoff; all other tokens are preserved. A contradiction deliberately raised by the book is an expected error. Where the book prints a placeholder answer, the test checks an independently specified exercise result. These categories are not exact textual matches.

## Execution adaptations

Original prose, exercise instructions and printed results remain unchanged. Editable support code is supplied separately in each interpreter:

- Missing exercise procedures receive explicitly identified TP reference implementations; students may edit or replace them.
- Constructors and mutable state use the versions and preceding operations from the corresponding passage, rather than unrelated later definitions with the same name.
- Infinite streams display only the finite prefix printed in the book. The coin-count recurrence caches repeated subproblems for browser performance.
- Chapters 4 and 5 use the original metacircular, lazy, nondeterministic and query evaluators, register-machine simulator and compiler. Finite drivers replace blocking input loops and replay the state needed by transcript continuations.
- Closure environments and memoized thunks use message-passing storage in the embedded evaluators to avoid LIPS traversing cyclic value representations. Evaluation, lexical scoping and memoization remain explicit in Scheme.
- The 1,000-step lazy integral uses the equivalent explicit delay/force solver from section 3.5.4 to avoid the cost of a second interpretation layer. Its recurrence and result are computed, not substituted.
- Pure Scheme support programs can disable LIPS promise/cycle instrumentation after their cyclic environments have been hidden behind message-passing objects. This is a runtime adaptation, not portable Scheme syntax.
- The compiler's stack statistics come from the instrumented stack during execution; expected numbers are never injected into the output.

Only the 119 detected interactive cells are covered. Other listings and exercises are not claimed to be executable. Remaining failures, timeouts and browser checks are reported separately below.

## Verification in tp-scheme

The browser check opens the actual generated reading pages in Chromium and runs each light-DOM tp-scheme cell. It checks that the editor source and query equal the verified manifest, then compares the transcript after the query prompt. Program-loading output is retained separately in the recorded transcript. The pinned LIPS runtime is loaded by tp-scheme itself, not replaced by a test mock.

Current source verified in the browser: **${browserCurrent.length}/${examples.length} cells**. Results: ${browserCounts.passed} matching, ${browserCounts.equivalent} equivalent, ${browserCounts['exercise-result']} exercise answers, ${browserCounts['expected-error']} expected-error cases, ${browserCounts.different} differences, ${browserCounts.error} unexpected errors. Missing or stale: **${examples.length-browserCurrent.length}**.

${browserCurrent.filter(r=>['different','error'].includes(r.status)).map(r=>`- ${r.id}: ${escape(r.error??r.reason??r.actual)}`).join('\n')}

## Bibliography and citations

The reading edition uses tp-ref with the original author-date wording, tp-biblio definitions and one tp-listof on each page containing citations. References uses one merged tp-global-listof, retaining uncited notices and combining identical local definitions. Its links lead back to every citation, grouped by page; local reference scopes remain independent.

There are **${bibliography.citations.length} citation occurrences** and **${bibliography.entries.length} distinct notices**. Citations explicitly tagged in the XML are converted structurally. Additional plain-text author-date citations are linked using a reviewed mapping; historical dates and Scheme source are not heuristically rewritten. The canonical text used for PDF comparison is unchanged.

Eight notices cited in the PDF are absent from its bibliography. The linked edition restores the exact notices below, preserving the citation wording and keeping every original bibliography entry. These are disclosed editorial additions, not changes to the supplied PDF.

| Notice | Provenance |
| --- | --- |
${bibliography.entries.filter(e=>e.supplemental).map(e=>`| ${e.label} | ${e.source?`[Original SICP bibliography](${e.source})`:e.provenance} |`).join('\n')}

Browser checks in scripts/verify-bibliography.mjs verify local labels, tooltip content, local lists, global merging, citation links and browser Back navigation. Results are recorded in bibliography-verification.json.${bibliographyCheck?` Latest successful run: **${bibliographyCheck.pages.length} citing pages, ${bibliographyCheck.global.citations} citation links, one merged list of ${bibliographyCheck.global.terms} notices**, with tooltips and browser Back checked.`:''}

## Text conformity

All 33 reading sections have been compared with the supplied PDF. See the [section-by-section text conformity audit](text-conformity.md) for the method, corrections, authorized exceptions and limits. Execution failures above remain independent of that check.

## Source recovery

The initially supplied Markdown is preserved unchanged for provenance, but is not used as the reading text: its exporter omitted Scheme-specific passages. The reading text is regenerated from the original XML at the revision recorded in source/upstream.json, selecting Scheme and PDF-only content. It includes 357 exercises, 338 notes and 95 figure captions. The 620-page original PDF is included, identified by SHA-256 in source/reference.json, and linked from every section. Its title pages and printed index remain available in that PDF.

Text recovery and interpreter compatibility are separate checks. Original prose and printed results are retained; added dependency programs and verification notices are editorial additions. The detailed text conformity report records comparisons against the PDF itself, not only the XML revision. Formula layout, page breaks and typography can differ in the web presentation. Global names can denote different procedures in different sections; adaptations select the appropriate version for each tested cell.

## Interactive examples

| Example | Context | Result | Detail |
| --- | --- | --- | --- |
${results.map(r=>{const e=examples.find(e=>e.id===r.id);return `| [${r.id}](${r.page}#${r.id}) | ${e.exercise?`Exercise ${e.exercise}`:'Demonstration / transcript'} | ${r.status} | ${escape([r.error, r.status==='different'?`Expected: ${r.expected}\nActual: ${r.actual}`:r.reason, e.adaptation].filter(Boolean).join(' — ') || 'Matches the supplied result')} |`;}).join('\n')}

## Reproduce

Run pnpm adapt, then node packages/sicp/scripts/verify.mjs. With pnpm dev:sicp running, run node packages/sicp/scripts/verify-browser.mjs (BOOK_URL defaults to http://127.0.0.1:4340/), then node packages/sicp/scripts/audit.mjs from the repository root. verification.json contains the complete actual and expected outputs. No browser execution is triggered when a page opens.
`;
writeFileSync(new URL('public/docs/audit.md',root),text);
// Add an explicit notice to examples that are not verified, without hiding the interpreter.
for(const page of new Set(examples.map(e=>e.page))){
 const path=new URL(`public/docs/${page}`,root);let source=readFileSync(path,'utf8');
 source=source.replace(/<!-- verification:[\s\S]*?<!-- \/verification -->\n\n/g,'');
 for(const r of results.filter(r=>r.page===page&&(r.status!=='passed'||examples.find(e=>e.id===r.id)?.adaptation))){
  const e=examples.find(e=>e.id===r.id);
  const note=['passed','equivalent','exercise-result','expected-error'].includes(r.status)
    ? `**TP adaptation:** ${e.adaptation??r.reason??'Verified exercise result.'}`
    : `**Verification ${r.status}:** ${r.error??'The output still differs from the book.'}`;
  const marker=`::: tp-scheme {mode="simple" id="${r.id}"`;
  source=source.replace(marker,`<!-- verification:${r.id} -->\n${note} [Verification details](audit.md).\n<!-- /verification -->\n\n${marker}`);
 }
 writeFileSync(path,source);
}
console.log(counts);

await import("./text-audit.mjs");
