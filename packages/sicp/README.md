# SICP · TP Books

This book uses `tp-markdown-multi-pages` and `tp-scheme mode="simple"`.

- `source/sicp.md`: unchanged supplied Markdown, retained only for provenance; its missing Scheme passages make it unsuitable as the reading source.
- `source/upstream/xml/`: original XML archive at the revision recorded in `source/upstream.json`.
- `source/sicp-canonical.md`: reading text regenerated from Scheme/PDF branches.
- `public/original/sicp.pdf`: unchanged authoritative PDF, linked from every reading section.
- `source/pdf-definitions.json`: definitions recovered from the supplied Scheme Edition PDF, with PDF page numbers.
- `scripts/adapt.mjs`: reproducible section splitting and query/result adaptation.
- `pages.json`: source ranges for each level-one/level-two section.
- `examples.json`: programs, queries and expected results for interactive examples.
- `verification.json`: actual LIPS execution results, including errors and differences.
- `public/docs/audit.md`: readable verification report and limitations.

Press Return in an interpreter's query field to run its program and query. Changed source is reloaded automatically. Adjacent queries are grouped to preserve their execution order and state. Each interpreter has its own environment; reading a previous page is not required.

## Verification

```sh
pnpm adapt
pnpm exec node scripts/verify.mjs
pnpm test
pnpm build
```

This is an initial interactive adaptation, not a claim that all of SICP runs unchanged in LIPS. Exercise specifications deliberately omit implementations; chapters 4 and 5 also contain inputs to embedded evaluators, query languages and register-machine simulators, rather than ordinary Scheme queries. The audit records these cases explicitly. Expected results from the book are retained separately from actual results.

The original Markdown has extraction defects; the reading edition instead restores the original XML Scheme content. PDF pagination and typography are not reproduced in the web edition. The printed index is available in the linked original PDF. No automatically generated exercise solution is presented as original book content.

## Text conformity

All 33 reading sections are compared against the original PDF. See `public/docs/text-conformity.md`, `text-verification.json` and the reviewed exceptions in `source/text-review.json`. With Python and `pymupdf==2.1`, run `python3 packages/sicp/scripts/verify-text.py` from the repository root. New unreviewed differences fail the check. This content audit does not claim identical PDF typography or successful execution of every Scheme transcript.
