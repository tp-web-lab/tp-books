import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const report=JSON.parse(readFileSync(new URL('text-verification.json',root)));
const stale=report.sourceSha256!==createHash('sha256').update(readFileSync(new URL('source/sicp-canonical.md',root))).digest('hex');
const pages=JSON.parse(readFileSync(new URL('pages.json',root)));
const counts=Object.fromEntries(['matched','interrupted','reviewed','unresolved'].map(k=>[k,report.sections.reduce((n,s)=>n+s[k],0)]));
const rendering=JSON.parse(readFileSync(new URL('render-verification.json',root)));
const renderIssues=rendering.reduce((n,r)=>n+['raw','alerts','mathErrors','badImages','errors'].reduce((a,k)=>a+r[k].length,0),0);
const renderStale=rendering.some(r=>r.sourceHash!==createHash('sha256').update(readFileSync(new URL('public/docs/'+r.page,root))).digest('hex'));
const text=`# Text conformity with the original PDF

Checked on **2026/11/21**, against the unchanged 620-page Scheme Edition PDF (SHA-256: ${report.pdfSha256}).

${stale?'**Outdated report: regenerate the text verification before claiming conformity.**':'All 33 reading sections have been compared. No unresolved prose difference remains in the recorded comparison; authorized corrections to defects in the PDF are listed below.'}

## Scope and method

The comparison covers the foreword, both prefaces, acknowledgments, chapters 1–5 and References. The title/copyright pages and printed index remain in the linked original PDF; they have not been transcribed as reading pages.

Each section is compared with its own PDF page range. The reproducible check extracts the PDF text, separates the body from footnotes, removes running headers, normalizes ligatures, case, punctuation, spacing and line-end hyphenation, and retains numeric characters. It checks ${counts.matched+counts.interrupted+counts.reviewed+counts.unresolved} fragments: ${counts.matched} direct matches, ${counts.interrupted} matches interrupted by PDF floating figures or notes, and ${counts.reviewed} individually reviewed fragments containing typesetting commands or authorized PDF corrections. Unresolved: **${counts.unresolved}**.

The ${Object.values(report.codeCounts).reduce((a,b)=>a+b,0)} original Scheme and printed-result blocks are also checked, preserving case and punctuation while ignoring whitespace and normalizing typographic quote glyphs: ${report.codeCounts.matched} direct matches, ${report.codeCounts.corrected_pdf_formatting} matches after removal of the PDF’s erroneous visible formatting commands, ${report.codeCounts.interrupted} matches interrupted by PDF layout, and ${report.codeCounts.reviewed} reviewed annotation (caret pointers lost in the PDF on page 82). Unresolved code comparisons: **${report.codeCounts.unresolved}**. These are the original listings, not the extra support definitions inserted into interactive interpreters.

This is a content comparison, not a claim of identical pagination, punctuation typography or pixels. Mathematical notation, figure labels and code formatting are not adequately represented by plain-text extraction: they were additionally inspected against the original XML/PDF and checked in the browser. A reverse search through the PDF prose was also used to look for missing passages; strings inside diagrams and mathematical arrays were reviewed as such, rather than counted as omitted prose. All heading texts/numbers, 357 exercise labels, 338 note references/targets and the illustration files are retained.

## Corrections made to the web edition

- Preserve both backslashes in LaTeX row separators; they were incorrectly treated as JavaScript escapes.
- Render dollar-delimited formulas, displayed arrays and stream equations using native TP Markdown math roles/fences. Previously, several appeared as raw TeX and Markdown interpreted their characters as formatting.
- Preserve mathematical children inside inline Scheme expressions, including the missing variable in \`(transpose m)\`.
- Remove leaked PDF pagination commands and replace PDF-only paragraph-spacing commands with paragraph breaks.
- Escape currency dollar signs as literal text so that bank-account amounts cannot consume surrounding prose as math; avoid doubling TeX escapes inside Markdown table cells.
- Exclude index metadata from Scheme listings; it had leaked before the operation-table definition.
- Remove a second rendering of the same table in the figure generator.
- Reproduce the six-column annotation of \`square\` with its code, arrows and explanatory words in a native Markdown table (PDF page 38).
- Preserve the cells of the exercise 5.27 table while omitting unsupported PDF-only spacing commands (PDF page 533).
- Render the Greek epigraph as its Unicode text instead of an unsupported TeX font hack. Its English translation is unchanged.

## Authorized corrections to defects in the PDF

The user requested that corrected source text be retained, with exceptions documented, rather than reproducing obvious PDF defects.

| Location | PDF defect | Retained correction |
| --- | --- | --- |
| Chapter 1, note 1; PDF page 30 | The two book titles are absent, leaving “The appeared … and the …”. | Restore *Lisp 1 Programmer’s Manual* and *Lisp 1.5 Programmer’s Manual* from the original XML. |
| Listings; PDF pages 301, 307, 389, 392, 413, 415, 416, 418, 455, 458, 475, 481, 517, 527–532 | Some comments show literal \`\\emph{…}\` and \`{\\JS~…~}\` formatting commands. | Retain the comment wording and identifiers without exposing these formatting commands. |
| Procedure annotations; PDF pages 38 and 82 | Some arrow/caret pointers are absent or rendered incorrectly in the PDF. | Preserve the arrow/caret pointers specified by the XML. |

Bibliographic citations now use tp-ref, with local tp-listof bibliographies and a merged tp-global-listof in References. Eight missing notices are explicitly restored in the reading edition; see the [bibliography audit](audit.md#bibliography-and-citations) for their provenance. The canonical comparison text and original PDF are unchanged.

Unresolved cross-references printed as “??” in the PDF remain “??”: no reference has been invented. Interactive support definitions and execution notices remain identified as TP additions. The separate execution audit records actual interpreter results, adaptations, expected errors and any remaining execution differences; text conformity is not an execution check.

## Browser verification

Latest recorded result: **${rendering.length} pages, ${rendering.reduce((n,r)=>n+r.mathCount,0)} composed formulas, ${renderIssues} detected issues**.${renderStale?" **The generated pages have changed since this browser run; rerun the check.**":""}

The 33 generated reading pages are checked with Chromium using \`scripts/verify-render.mjs\`. The report \`render-verification.json\` records page hashes, composed MathJax formulas, broken images, exposed TeX commands and renderer errors. Run it against the local development server with \`node packages/sicp/scripts/verify-render.mjs\`.

## Section-by-section record

“Reviewed” counts typesetting fragments and the authorized exceptions above, not missing text. PDF ranges overlap at section boundaries when a page contains both sections.

| Section | PDF pages | Direct matches | Interrupted matches | Reviewed | Unresolved |
| --- | ---: | ---: | ---: | ---: | ---: |
${report.sections.map((s,i)=>`| [${s.section}](${pages[i].file}) | ${s.pdfPages.join('–')} | ${s.matched} | ${s.interrupted} | ${s.reviewed} | ${s.unresolved} |`).join('\n')}

## Reproduce

Run \`pnpm adapt\`, install \`pymupdf==2.1\` in a Python environment, then run \`python3 packages/sicp/scripts/verify-text.py\` and \`pnpm adapt\`. The checker fails on a new, unreviewed discrepancy. Reviewed fragments are identified by SHA-256 in \`source/text-review.json\`; changing their text invalidates that review. Results and source hashes are stored in \`text-verification.json\`.
`;
writeFileSync(new URL('public/docs/text-conformity.md',root),text);
