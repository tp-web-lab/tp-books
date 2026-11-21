# Adaptation and execution audit

## Scope

The 33 source sections (headings # and ##) are preserved as individual pages. This edition currently identifies 201 adjacent input/result pairs and groups them into 119 interpreters. This count is **not** a claim that every code block in the book is executable or that automatic detection finds all examples. Ordinary definitions, derivation steps, syntax templates and unfinished exercises remain in their original context.

## Measured results

Tests use LIPS 1.0.0-beta.23.1, the same version as tp-scheme. Each example runs in an isolated worker. The test records the actual output; the original expected result is never substituted for it.

| Matches (whitespace ignored) | Equivalent values / printing | Exercise answers | Intentional error | Different output | Unexpected error / timeout | Not verified after editing |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 108 | 7 | 3 | 1 | 0 | 0 | 0 |

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

Current source verified in the browser: **119/119 cells**. Results: 107 matching, 8 equivalent, 3 exercise answers, 1 expected-error cases, 0 differences, 0 unexpected errors. Missing or stale: **0**.



## Text conformity

All 33 reading sections have been compared with the supplied PDF. See the [section-by-section text conformity audit](text-conformity.md) for the method, corrections, authorized exceptions and limits. Execution failures above remain independent of that check.

## Source recovery

The initially supplied Markdown is preserved unchanged for provenance, but is not used as the reading text: its exporter omitted Scheme-specific passages. The reading text is regenerated from the original XML at the revision recorded in source/upstream.json, selecting Scheme and PDF-only content. It includes 357 exercises, 338 notes and 95 figure captions. The 620-page original PDF is included, identified by SHA-256 in source/reference.json, and linked from every section. Its title pages and printed index remain available in that PDF.

Text recovery and interpreter compatibility are separate checks. Original prose and printed results are retained; added dependency programs and verification notices are editorial additions. The detailed text conformity report records comparisons against the PDF itself, not only the XML revision. Formula layout, page breaks and typography can differ in the web presentation. Global names can denote different procedures in different sections; adaptations select the appropriate version for each tested cell.

## Interactive examples

| Example | Context | Result | Detail |
| --- | --- | --- | --- |
| [example-001](07-1-1-the-elements-of-programming.md#example-001) | Demonstration / transcript | passed | Matches the supplied result |
| [example-002](07-1-1-the-elements-of-programming.md#example-002) | Demonstration / transcript | passed | Matches the supplied result |
| [example-003](07-1-1-the-elements-of-programming.md#example-003) | Demonstration / transcript | passed | Matches the supplied result |
| [example-004](07-1-1-the-elements-of-programming.md#example-004) | Demonstration / transcript | passed | Matches the supplied result |
| [example-005](07-1-1-the-elements-of-programming.md#example-005) | Demonstration / transcript | passed | Matches the supplied result |
| [example-006](07-1-1-the-elements-of-programming.md#example-006) | Demonstration / transcript | passed | Matches the supplied result |
| [example-007](07-1-1-the-elements-of-programming.md#example-007) | Demonstration / transcript | passed | Matches the supplied result |
| [example-008](07-1-1-the-elements-of-programming.md#example-008) | Demonstration / transcript | passed | Matches the supplied result |
| [example-009](07-1-1-the-elements-of-programming.md#example-009) | Demonstration / transcript | passed | Matches the supplied result |
| [example-010](07-1-1-the-elements-of-programming.md#example-010) | Demonstration / transcript | passed | Matches the supplied result |
| [example-011](07-1-1-the-elements-of-programming.md#example-011) | Exercise 1.6 | passed | Matches the supplied result |
| [example-012](08-1-2-procedures-and-the-processes-they-generate.md#example-012) | Demonstration / transcript | passed | Matches the supplied result |
| [example-013](09-1-3-formulating-abstractions-with-higher-order-procedures.md#example-013) | Demonstration / transcript | passed | Matches the supplied result |
| [example-014](09-1-3-formulating-abstractions-with-higher-order-procedures.md#example-014) | Demonstration / transcript | passed | Matches the supplied result |
| [example-015](09-1-3-formulating-abstractions-with-higher-order-procedures.md#example-015) | Demonstration / transcript | passed | Matches the supplied result |
| [example-016](09-1-3-formulating-abstractions-with-higher-order-procedures.md#example-016) | Demonstration / transcript | equivalent | Same values and structure; Scheme printing, spacing or printed numeric rounding differs. |
| [example-017](09-1-3-formulating-abstractions-with-higher-order-procedures.md#example-017) | Demonstration / transcript | passed | Matches the supplied result |
| [example-018](09-1-3-formulating-abstractions-with-higher-order-procedures.md#example-018) | Exercise 1.34 | passed | Matches the supplied result |
| [example-019](09-1-3-formulating-abstractions-with-higher-order-procedures.md#example-019) | Demonstration / transcript | passed | Matches the supplied result |
| [example-020](09-1-3-formulating-abstractions-with-higher-order-procedures.md#example-020) | Demonstration / transcript | passed | Matches the supplied result |
| [example-021](09-1-3-formulating-abstractions-with-higher-order-procedures.md#example-021) | Demonstration / transcript | passed | Matches the supplied result |
| [example-022](09-1-3-formulating-abstractions-with-higher-order-procedures.md#example-022) | Demonstration / transcript | passed | Matches the supplied result |
| [example-023](09-1-3-formulating-abstractions-with-higher-order-procedures.md#example-023) | Exercise 1.42 | passed | Matches the supplied result |
| [example-024](09-1-3-formulating-abstractions-with-higher-order-procedures.md#example-024) | Exercise 1.43 | passed | Editable reference implementation supplied by TP for this exercise; not original book text. |
| [example-025](11-2-1-introduction-to-data-abstraction.md#example-025) | Demonstration / transcript | passed | Matches the supplied result |
| [example-026](11-2-1-introduction-to-data-abstraction.md#example-026) | Demonstration / transcript | passed | Matches the supplied result |
| [example-027](11-2-1-introduction-to-data-abstraction.md#example-027) | Demonstration / transcript | passed | Matches the supplied result |
| [example-028](11-2-1-introduction-to-data-abstraction.md#example-028) | Demonstration / transcript | passed | Matches the supplied result |
| [example-029](11-2-1-introduction-to-data-abstraction.md#example-029) | Demonstration / transcript | passed | Use the reduced-fraction constructor introduced immediately before this example. |
| [example-030](12-2-2-hierarchical-data-and-the-closure-property.md#example-030) | Demonstration / transcript | passed | Matches the supplied result |
| [example-031](12-2-2-hierarchical-data-and-the-closure-property.md#example-031) | Demonstration / transcript | passed | Matches the supplied result |
| [example-032](12-2-2-hierarchical-data-and-the-closure-property.md#example-032) | Demonstration / transcript | passed | Matches the supplied result |
| [example-033](12-2-2-hierarchical-data-and-the-closure-property.md#example-033) | Demonstration / transcript | passed | Matches the supplied result |
| [example-034](12-2-2-hierarchical-data-and-the-closure-property.md#example-034) | Exercise 2.17 | passed | Matches the supplied result |
| [example-035](12-2-2-hierarchical-data-and-the-closure-property.md#example-035) | Exercise 2.18 | passed | Matches the supplied result |
| [example-036](12-2-2-hierarchical-data-and-the-closure-property.md#example-036) | Exercise 2.19 | passed | Editable reference implementation supplied by TP for this exercise; not original book text. |
| [example-037](12-2-2-hierarchical-data-and-the-closure-property.md#example-037) | Exercise 2.20 | passed | Editable reference implementation supplied by TP for this exercise; not original book text. |
| [example-038](12-2-2-hierarchical-data-and-the-closure-property.md#example-038) | Demonstration / transcript | passed | Matches the supplied result |
| [example-039](12-2-2-hierarchical-data-and-the-closure-property.md#example-039) | Demonstration / transcript | passed | Matches the supplied result |
| [example-040](12-2-2-hierarchical-data-and-the-closure-property.md#example-040) | Exercise 2.21 | passed | Editable reference implementation supplied by TP for this exercise; not original book text. |
| [example-041](12-2-2-hierarchical-data-and-the-closure-property.md#example-041) | Exercise 2.23 | passed | Matches the supplied result |
| [example-042](12-2-2-hierarchical-data-and-the-closure-property.md#example-042) | Demonstration / transcript | passed | Matches the supplied result |
| [example-043](12-2-2-hierarchical-data-and-the-closure-property.md#example-043) | Exercise 2.27 | passed | Editable reference implementation supplied by TP for this exercise; not original book text. |
| [example-044](12-2-2-hierarchical-data-and-the-closure-property.md#example-044) | Exercise 2.28 | passed | Editable reference implementation supplied by TP for this exercise; not original book text. |
| [example-045](12-2-2-hierarchical-data-and-the-closure-property.md#example-045) | Demonstration / transcript | passed | Matches the supplied result |
| [example-046](12-2-2-hierarchical-data-and-the-closure-property.md#example-046) | Exercise 2.30 | passed | Editable reference implementation supplied by TP for this exercise; not original book text. |
| [example-047](12-2-2-hierarchical-data-and-the-closure-property.md#example-047) | Demonstration / transcript | passed | Matches the supplied result |
| [example-048](12-2-2-hierarchical-data-and-the-closure-property.md#example-048) | Demonstration / transcript | passed | Matches the supplied result |
| [example-049](12-2-2-hierarchical-data-and-the-closure-property.md#example-049) | Demonstration / transcript | passed | Matches the supplied result |
| [example-050](12-2-2-hierarchical-data-and-the-closure-property.md#example-050) | Demonstration / transcript | passed | Matches the supplied result |
| [example-051](12-2-2-hierarchical-data-and-the-closure-property.md#example-051) | Demonstration / transcript | passed | Matches the supplied result |
| [example-052](12-2-2-hierarchical-data-and-the-closure-property.md#example-052) | Demonstration / transcript | passed | Matches the supplied result |
| [example-053](12-2-2-hierarchical-data-and-the-closure-property.md#example-053) | Demonstration / transcript | passed | Matches the supplied result |
| [example-054](13-2-3-symbolic-data.md#example-054) | Demonstration / transcript | passed | Matches the supplied result |
| [example-055](13-2-3-symbolic-data.md#example-055) | Demonstration / transcript | passed | Matches the supplied result |
| [example-056](13-2-3-symbolic-data.md#example-056) | Demonstration / transcript | passed | Matches the supplied result |
| [example-057](13-2-3-symbolic-data.md#example-057) | Demonstration / transcript | passed | Use the simplified constructors, not the earlier unsimplified versions. |
| [example-058](14-2-4-multiple-representations-for-abstract-data.md#example-058) | Exercise 2.73 | passed | Matches the supplied result |
| [example-059](17-3-1-assignment-and-local-state.md#example-059) | Demonstration / transcript | passed | Matches the supplied result |
| [example-060](17-3-1-assignment-and-local-state.md#example-060) | Demonstration / transcript | passed | Matches the supplied result |
| [example-061](17-3-1-assignment-and-local-state.md#example-061) | Demonstration / transcript | passed | Matches the supplied result |
| [example-062](17-3-1-assignment-and-local-state.md#example-062) | Exercise 3.1 | passed | Editable reference implementation supplied by TP for this exercise; not original book text. |
| [example-063](17-3-1-assignment-and-local-state.md#example-063) | Exercise 3.2 | passed | TP reference implementation of make-monitored; use the Scheme numeric square root, not the symbolic derivative example. |
| [example-064](17-3-1-assignment-and-local-state.md#example-064) | Exercise 3.3 | passed | TP reference implementation of the password-protected account exercise. |
| [example-065](17-3-1-assignment-and-local-state.md#example-065) | Demonstration / transcript | passed | Matches the supplied result |
| [example-066](17-3-1-assignment-and-local-state.md#example-066) | Demonstration / transcript | passed | Matches the supplied result |
| [example-067](17-3-1-assignment-and-local-state.md#example-067) | Demonstration / transcript | passed | Matches the supplied result |
| [example-068](18-3-2-the-environment-model-of-evaluation.md#example-068) | Demonstration / transcript | passed | Matches the supplied result |
| [example-069](18-3-2-the-environment-model-of-evaluation.md#example-069) | Demonstration / transcript | passed | Matches the supplied result |
| [example-070](18-3-2-the-environment-model-of-evaluation.md#example-070) | Exercise 3.11 | passed | Matches the supplied result |
| [example-071](19-3-3-modeling-with-mutable-data.md#example-071) | Exercise 3.12 | exercise-result | Matches the supplied result |
| [example-072](19-3-3-modeling-with-mutable-data.md#example-072) | Exercise 3.12 | exercise-result | Matches the supplied result |
| [example-073](19-3-3-modeling-with-mutable-data.md#example-073) | Demonstration / transcript | passed | Matches the supplied result |
| [example-074](19-3-3-modeling-with-mutable-data.md#example-074) | Exercise 3.20 | passed | Replay the mutation preceding this query in the book. |
| [example-075](19-3-3-modeling-with-mutable-data.md#example-075) | Exercise 3.21 | passed | Matches the supplied result |
| [example-076](19-3-3-modeling-with-mutable-data.md#example-076) | Demonstration / transcript | passed | Supply the or-gate exercise used by the book’s half-adder; preserve agenda and propagation times. |
| [example-077](19-3-3-modeling-with-mutable-data.md#example-077) | Demonstration / transcript | passed | Matches the supplied result |
| [example-078](19-3-3-modeling-with-mutable-data.md#example-078) | Demonstration / transcript | passed | Keep the returned status on a separate line from probe output. |
| [example-079](19-3-3-modeling-with-mutable-data.md#example-079) | Demonstration / transcript | passed | Keep the returned status on a separate line from probe output. |
| [example-080](19-3-3-modeling-with-mutable-data.md#example-080) | Demonstration / transcript | passed | Matches the supplied result |
| [example-081](19-3-3-modeling-with-mutable-data.md#example-081) | Demonstration / transcript | passed | Keep the returned status on a separate line from probe output. |
| [example-082](19-3-3-modeling-with-mutable-data.md#example-082) | Demonstration / transcript | expected-error | Contradiction — The book intentionally raises this contradiction. — This example intentionally demonstrates a contradiction; the error is the expected result. |
| [example-083](19-3-3-modeling-with-mutable-data.md#example-083) | Demonstration / transcript | passed | Keep the returned status on a separate line from probe output. |
| [example-084](19-3-3-modeling-with-mutable-data.md#example-084) | Demonstration / transcript | passed | Keep the returned status on a separate line from probe output. |
| [example-085](20-3-4-concurrency-time-is-of-the-essence.md#example-085) | Demonstration / transcript | passed | Matches the supplied result |
| [example-086](21-3-5-streams.md#example-086) | Demonstration / transcript | passed | Matches the supplied result |
| [example-087](21-3-5-streams.md#example-087) | Demonstration / transcript | passed | Matches the supplied result |
| [example-088](21-3-5-streams.md#example-088) | Demonstration / transcript | equivalent | Same values and structure; Scheme printing, spacing or printed numeric rounding differs. — Variadic stream-map and partial-sums; print only the finite prefix shown in the book, not an infinite stream. |
| [example-089](21-3-5-streams.md#example-089) | Demonstration / transcript | equivalent | Same values and structure; Scheme printing, spacing or printed numeric rounding differs. — Initialize the pi stream after installing partial-sums. |
| [example-090](21-3-5-streams.md#example-090) | Demonstration / transcript | passed | Initialize the pi stream after installing partial-sums. |
| [example-091](21-3-5-streams.md#example-091) | Demonstration / transcript | equivalent | Same values and structure; Scheme printing, spacing or printed numeric rounding differs. — Initialize the pi stream after installing partial-sums. |
| [example-092](21-3-5-streams.md#example-092) | Demonstration / transcript | equivalent | Same values and structure; Scheme printing, spacing or printed numeric rounding differs. — Variadic stream-map and partial-sums; print only the finite prefix shown in the book, not an infinite stream. |
| [example-093](23-4-1-the-metacircular-evaluator.md#example-093) | Demonstration / transcript | passed | Run the original metacircular evaluator with a finite, editable input sequence instead of entering a blocking read loop. |
| [example-094](23-4-1-the-metacircular-evaluator.md#example-094) | Demonstration / transcript | passed | Run the original metacircular evaluator with a finite, editable input sequence instead of entering a blocking read loop. |
| [example-095](24-4-2-variations-on-a-scheme-lazy-evaluation.md#example-095) | Demonstration / transcript | passed | Run the original lazy evaluator with a finite, editable input sequence instead of entering a blocking read loop. |
| [example-096](24-4-2-variations-on-a-scheme-lazy-evaluation.md#example-096) | Exercise 4.30 | exercise-result | Run the original lazy evaluator with a finite, editable input sequence instead of entering a blocking read loop. |
| [example-097](24-4-2-variations-on-a-scheme-lazy-evaluation.md#example-097) | Exercise 4.31 | passed | Run the original lazy evaluator with a finite, editable input sequence instead of entering a blocking read loop. |
| [example-098](24-4-2-variations-on-a-scheme-lazy-evaluation.md#example-098) | Demonstration / transcript | passed | Run the original lazy evaluator with a finite, editable input sequence instead of entering a blocking read loop. |
| [example-099](24-4-2-variations-on-a-scheme-lazy-evaluation.md#example-099) | Demonstration / transcript | equivalent | Same values and structure; Scheme printing, spacing or printed numeric rounding differs. — For this 1,000-step calculation, express lazy pairs with explicit delay/force using the equivalent integral and solve definitions from section 3.5.4. This avoids evaluating every numeric step twice; the recurrence, step size and computed result are unchanged. The preceding cell demonstrates the complete lazy evaluator. |
| [example-100](25-4-3-variations-on-a-scheme-nondeterministic-computing.md#example-100) | Demonstration / transcript | passed | Use the book’s nondeterministic evaluator with saved failure continuations; TP supplies the let, permanent-set! and if-fail exercise extensions. |
| [example-101](25-4-3-variations-on-a-scheme-nondeterministic-computing.md#example-101) | Demonstration / transcript | passed | Use the book’s nondeterministic evaluator with saved failure continuations; TP supplies the let, permanent-set! and if-fail exercise extensions. |
| [example-102](25-4-3-variations-on-a-scheme-nondeterministic-computing.md#example-102) | Demonstration / transcript | passed | Use the book’s nondeterministic evaluator with saved failure continuations; TP supplies the let, permanent-set! and if-fail exercise extensions. |
| [example-103](25-4-3-variations-on-a-scheme-nondeterministic-computing.md#example-103) | Demonstration / transcript | passed | Use the book’s nondeterministic evaluator with saved failure continuations; TP supplies the let, permanent-set! and if-fail exercise extensions. |
| [example-104](25-4-3-variations-on-a-scheme-nondeterministic-computing.md#example-104) | Demonstration / transcript | passed | Use the book’s nondeterministic evaluator with saved failure continuations; TP supplies the let, permanent-set! and if-fail exercise extensions. |
| [example-105](25-4-3-variations-on-a-scheme-nondeterministic-computing.md#example-105) | Demonstration / transcript | passed | Use the book’s nondeterministic evaluator with saved failure continuations; TP supplies the let, permanent-set! and if-fail exercise extensions. |
| [example-106](25-4-3-variations-on-a-scheme-nondeterministic-computing.md#example-106) | Exercise 4.52 | passed | Use the book’s nondeterministic evaluator with saved failure continuations; TP supplies the let, permanent-set! and if-fail exercise extensions. |
| [example-107](25-4-3-variations-on-a-scheme-nondeterministic-computing.md#example-107) | Exercise 4.53 | passed | Use the book’s nondeterministic evaluator with saved failure continuations; TP supplies the let, permanent-set! and if-fail exercise extensions. |
| [example-108](26-4-4-logic-programming.md#example-108) | Demonstration / transcript | passed | Execute the original stream-based query evaluator and append-to-form rules, with a finite driver. |
| [example-109](26-4-4-logic-programming.md#example-109) | Demonstration / transcript | passed | Execute the original stream-based query evaluator and append-to-form rules, with a finite driver. |
| [example-110](26-4-4-logic-programming.md#example-110) | Demonstration / transcript | passed | Execute the original stream-based query evaluator and append-to-form rules, with a finite driver. |
| [example-111](29-5-2-a-register-machine-simulator.md#example-111) | Demonstration / transcript | passed | Matches the supplied result |
| [example-112](31-5-4-the-explicit-control-evaluator.md#example-112) | Demonstration / transcript | equivalent | Same values and structure; Scheme printing, spacing or printed numeric rounding differs. — Assemble the book’s register machine and compiler; a finite driver replaces read-eval-print-loop. Stack statistics are measured by the original instrumented stack. |
| [example-113](32-5-5-compilation.md#example-113) | Exercise 5.41 | passed | Editable reference implementation supplied by TP for this exercise; not original book text. |
| [example-114](32-5-5-compilation.md#example-114) | Demonstration / transcript | passed | Assemble the book’s register machine and compiler; a finite driver replaces read-eval-print-loop. Stack statistics are measured by the original instrumented stack. |
| [example-115](32-5-5-compilation.md#example-115) | Demonstration / transcript | passed | Assemble the book’s register machine and compiler; a finite driver replaces read-eval-print-loop. Stack statistics are measured by the original instrumented stack. |
| [example-116](32-5-5-compilation.md#example-116) | Demonstration / transcript | passed | Assemble the book’s register machine and compiler; a finite driver replaces read-eval-print-loop. Stack statistics are measured by the original instrumented stack. |
| [example-117](32-5-5-compilation.md#example-117) | Demonstration / transcript | passed | Assemble the book’s register machine and compiler; a finite driver replaces read-eval-print-loop. Stack statistics are measured by the original instrumented stack. |
| [example-118](32-5-5-compilation.md#example-118) | Exercise 5.48 | passed | Assemble the book’s register machine and compiler; a finite driver replaces read-eval-print-loop. Stack statistics are measured by the original instrumented stack. |
| [example-119](32-5-5-compilation.md#example-119) | Exercise 5.48 | passed | Assemble the book’s register machine and compiler; a finite driver replaces read-eval-print-loop. Stack statistics are measured by the original instrumented stack. |

## Reproduce

Run pnpm adapt, then node packages/sicp/scripts/verify.mjs. With pnpm dev:sicp running, run node packages/sicp/scripts/verify-browser.mjs (BOOK_URL defaults to http://127.0.0.1:4340/), then node packages/sicp/scripts/audit.mjs from the repository root. verification.json contains the complete actual and expected outputs. No browser execution is triggered when a page opens.
