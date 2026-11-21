# Text conformity with the original PDF

Checked on **2026/11/21**, against the unchanged 620-page Scheme Edition PDF (SHA-256: f80ed2d39a69235ba7bc8ee7779a0533af78198b4b4e0bfb3a7d52748682b3da).

All 33 reading sections have been compared. No unresolved prose difference remains in the recorded comparison; authorized corrections to defects in the PDF are listed below.

## Scope and method

The comparison covers the foreword, both prefaces, acknowledgments, chapters 1–5 and References. The title/copyright pages and printed index remain in the linked original PDF; they have not been transcribed as reading pages.

Each section is compared with its own PDF page range. The reproducible check extracts the PDF text, separates the body from footnotes, removes running headers, normalizes ligatures, case, punctuation, spacing and line-end hyphenation, and retains numeric characters. It checks 9404 fragments: 9349 direct matches, 45 matches interrupted by PDF floating figures or notes, and 10 individually reviewed fragments containing typesetting commands or authorized PDF corrections. Unresolved: **0**.

The 1424 original Scheme and printed-result blocks are also checked, preserving case and punctuation while ignoring whitespace and normalizing typographic quote glyphs: 1403 direct matches, 17 matches after removal of the PDF’s erroneous visible formatting commands, 3 matches interrupted by PDF layout, and 1 reviewed annotation (caret pointers lost in the PDF on page 82). Unresolved code comparisons: **0**. These are the original listings, not the extra support definitions inserted into interactive interpreters.

This is a content comparison, not a claim of identical pagination, punctuation typography or pixels. Mathematical notation, figure labels and code formatting are not adequately represented by plain-text extraction: they were additionally inspected against the original XML/PDF and checked in the browser. A reverse search through the PDF prose was also used to look for missing passages; strings inside diagrams and mathematical arrays were reviewed as such, rather than counted as omitted prose. All heading texts/numbers, 357 exercise labels, 338 note references/targets and the illustration files are retained.

## Corrections made to the web edition

- Preserve both backslashes in LaTeX row separators; they were incorrectly treated as JavaScript escapes.
- Render dollar-delimited formulas, displayed arrays and stream equations using native TP Markdown math roles/fences. Previously, several appeared as raw TeX and Markdown interpreted their characters as formatting.
- Preserve mathematical children inside inline Scheme expressions, including the missing variable in `(transpose m)`.
- Remove leaked PDF pagination commands and replace PDF-only paragraph-spacing commands with paragraph breaks.
- Escape currency dollar signs as literal text so that bank-account amounts cannot consume surrounding prose as math; avoid doubling TeX escapes inside Markdown table cells.
- Exclude index metadata from Scheme listings; it had leaked before the operation-table definition.
- Remove a second rendering of the same table in the figure generator.
- Reproduce the six-column annotation of `square` with its code, arrows and explanatory words in a native Markdown table (PDF page 38).
- Preserve the cells of the exercise 5.27 table while omitting unsupported PDF-only spacing commands (PDF page 533).
- Render the Greek epigraph as its Unicode text instead of an unsupported TeX font hack. Its English translation is unchanged.

## Authorized corrections to defects in the PDF

The user requested that corrected source text be retained, with exceptions documented, rather than reproducing obvious PDF defects.

| Location | PDF defect | Retained correction |
| --- | --- | --- |
| Chapter 1, note 1; PDF page 30 | The two book titles are absent, leaving “The appeared … and the …”. | Restore *Lisp 1 Programmer’s Manual* and *Lisp 1.5 Programmer’s Manual* from the original XML. |
| Listings; PDF pages 301, 307, 389, 392, 413, 415, 416, 418, 455, 458, 475, 481, 517, 527–532 | Some comments show literal `\emph{…}` and `{\JS~…~}` formatting commands. | Retain the comment wording and identifiers without exposing these formatting commands. |
| Procedure annotations; PDF pages 38 and 82 | Some arrow/caret pointers are absent or rendered incorrectly in the PDF. | Preserve the arrow/caret pointers specified by the XML. |

Unresolved cross-references printed as “??” in the PDF remain “??”: no reference has been invented. Interactive support definitions and execution notices remain identified as TP additions. The separate execution audit still records examples that do not run or do not reproduce the printed result; text conformity does not make those execution failures pass.

## Browser verification

Latest recorded result: **33 pages, 1735 composed formulas, 0 detected issues**.

The 33 generated reading pages are checked with Chromium using `scripts/verify-render.mjs`. The report `render-verification.json` records page hashes, composed MathJax formulas, broken images, exposed TeX commands and renderer errors. Run it against the local development server with `node packages/sicp/scripts/verify-render.mjs`.

## Section-by-section record

“Reviewed” counts typesetting fragments and the authorized exceptions above, not missing text. PDF ranges overlap at section boundaries when a page contains both sections.

| Section | PDF pages | Direct matches | Interrupted matches | Reviewed | Unresolved |
| --- | ---: | ---: | ---: | ---: | ---: |
| [Foreword](01-foreword.md) | 15–21 | 85 | 0 | 0 | 0 |
| [Prefaces](02-prefaces.md) | 21–21 | 0 | 0 | 0 | 0 |
| [Preface](03-preface.md) | 21–22 | 23 | 0 | 0 | 0 |
| [Preface to the First Edition](04-preface-to-the-first-edition.md) | 22–25 | 47 | 0 | 0 | 0 |
| [Acknowledgments](05-acknowledgments.md) | 25–29 | 44 | 0 | 0 | 0 |
| [1 Building Abstractions with Procedures](06-1-building-abstractions-with-procedures.md) | 29–32 | 74 | 0 | 1 | 0 |
| [1.1 The Elements of Programming](07-1-1-the-elements-of-programming.md) | 32–54 | 440 | 1 | 3 | 0 |
| [1.2 Procedures and the Processes They Generate](08-1-2-procedures-and-the-processes-they-generate.md) | 54–76 | 547 | 0 | 0 | 0 |
| [1.3 Formulating Abstractions with Higher-Order Procedures](09-1-3-formulating-abstractions-with-higher-order-procedures.md) | 76–99 | 395 | 0 | 0 | 0 |
| [2 Building Abstractions with Data](10-2-building-abstractions-with-data.md) | 99–102 | 69 | 0 | 0 | 0 |
| [2.1 Introduction to Data Abstraction](11-2-1-introduction-to-data-abstraction.md) | 102–114 | 224 | 0 | 0 | 0 |
| [2.2 Hierarchical Data and the Closure Property](12-2-2-hierarchical-data-and-the-closure-property.md) | 114–154 | 582 | 5 | 0 | 0 |
| [2.3 Symbolic Data](13-2-3-symbolic-data.md) | 154–178 | 443 | 3 | 0 | 0 |
| [2.4 Multiple Representations for Abstract Data](14-2-4-multiple-representations-for-abstract-data.md) | 178–195 | 228 | 0 | 0 | 0 |
| [2.5 Systems with Generic Operations](15-2-5-systems-with-generic-operations.md) | 195–221 | 455 | 4 | 0 | 0 |
| [3 Modularity, Objects, and State](16-3-modularity-objects-and-state.md) | 221–222 | 23 | 0 | 0 | 0 |
| [3.1 Assignment and Local State](17-3-1-assignment-and-local-state.md) | 222–237 | 295 | 0 | 0 | 0 |
| [3.2 The Environment Model of Evaluation](18-3-2-the-environment-model-of-evaluation.md) | 237–251 | 204 | 4 | 0 | 0 |
| [3.3 Modeling with Mutable Data](19-3-3-modeling-with-mutable-data.md) | 251–292 | 597 | 4 | 0 | 0 |
| [3.4 Concurrency: Time Is of the Essence](20-3-4-concurrency-time-is-of-the-essence.md) | 292–310 | 314 | 2 | 0 | 0 |
| [3.5 Streams](21-3-5-streams.md) | 310–349 | 646 | 2 | 2 | 0 |
| [4 Metalinguistic Abstraction](22-4-metalinguistic-abstraction.md) | 349–351 | 66 | 0 | 0 | 0 |
| [4.1 The Metacircular Evaluator](23-4-1-the-metacircular-evaluator.md) | 351–385 | 492 | 1 | 0 | 0 |
| [4.2 Variations on a Scheme: Lazy Evaluation](24-4-2-variations-on-a-scheme-lazy-evaluation.md) | 385–397 | 181 | 1 | 0 | 0 |
| [4.3 Variations on a Scheme: Nondeterministic Computing](25-4-3-variations-on-a-scheme-nondeterministic-computing.md) | 397–420 | 341 | 1 | 0 | 0 |
| [4.4 Logic Programming](26-4-4-logic-programming.md) | 420–469 | 758 | 1 | 0 | 0 |
| [5 Computing with Register Machines](27-5-computing-with-register-machines.md) | 469–470 | 27 | 0 | 0 | 0 |
| [5.1 Designing Register Machines](28-5-1-designing-register-machines.md) | 470–488 | 269 | 11 | 1 | 0 |
| [5.2 A Register-Machine Simulator](29-5-2-a-register-machine-simulator.md) | 488–506 | 200 | 0 | 0 | 0 |
| [5.3 Storage Allocation and Garbage Collection](30-5-3-storage-allocation-and-garbage-collection.md) | 506–518 | 221 | 3 | 0 | 0 |
| [5.4 The Explicit-Control Evaluator](31-5-4-the-explicit-control-evaluator.md) | 518–534 | 245 | 0 | 2 | 0 |
| [5.5 Compilation](32-5-5-compilation.md) | 534–577 | 557 | 2 | 1 | 0 |
| [References](33-references.md) | 577–583 | 257 | 0 | 0 | 0 |

## Reproduce

Run `pnpm adapt`, install `pymupdf==2.1` in a Python environment, then run `python3 packages/sicp/scripts/verify-text.py` and `pnpm adapt`. The checker fails on a new, unreviewed discrepancy. Reviewed fragments are identified by SHA-256 in `source/text-review.json`; changing their text invalidates that review. Results and source hashes are stored in `text-verification.json`.
