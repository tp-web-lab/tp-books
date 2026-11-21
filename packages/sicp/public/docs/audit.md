# Adaptation and execution audit

## Scope

The 33 source sections (headings # and ##) are preserved as individual pages. This edition currently identifies 201 adjacent input/result pairs and groups them into 119 interpreters. This count is **not** a claim that every code block in the book is executable or that automatic detection finds all examples. Ordinary definitions, derivation steps, syntax templates and unfinished exercises remain in their original context.

## Measured results

Tests use LIPS 1.0.0-beta.23.1, the same version as tp-scheme. Each example runs in an isolated worker. The test records the actual output; the original expected result is never substituted for it.

| Exact output match | Different output | Execution error or time limit |
| ---: | ---: | ---: |
| 65 | 18 | 36 |

Differences include numeric formatting, alternative definitions, state mutations and deliberate exercise bugs. An exercise may correctly remain incomplete: its expected output specifies the goal, not a supplied solution. Chapters 4 and 5 include embedded languages and evaluator/VM transcripts that are not directly executable as ordinary LIPS queries. These are unresolved adaptations, not passing demonstrations.

Unverified after editing: 0.

## Text conformity

All 33 reading sections have been compared with the supplied PDF. See the [section-by-section text conformity audit](text-conformity.md) for the method, corrections, authorized exceptions and limits. Execution failures above remain independent of that check.

## Source recovery

The initially supplied Markdown is preserved unchanged for provenance, but is not used as the reading text: its exporter omitted Scheme-specific passages. The reading text is regenerated from the original XML at the revision recorded in source/upstream.json, selecting Scheme and PDF-only content. It includes 357 exercises, 338 notes and 95 figure captions. The 620-page original PDF is included, identified by SHA-256 in source/reference.json, and linked from every section. Its title pages and printed index remain available in that PDF.

Text recovery and interpreter compatibility are separate checks. Original prose and printed results are retained; added dependency programs and verification notices are editorial additions. The detailed text conformity report records comparisons against the PDF itself, not only the XML revision. Formula layout, page breaks and typography can differ in the web presentation. Global names can denote different procedures in different sections; the dependency resolver still needs review for the failing examples.

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
| [example-016](09-1-3-formulating-abstractions-with-higher-order-procedures.md#example-016) | Demonstration / transcript | different | Expected: .24998750000000042<br>.249999875000001<br>Actual: 0.24998750000000042<br>0.249999875000001 |
| [example-017](09-1-3-formulating-abstractions-with-higher-order-procedures.md#example-017) | Demonstration / transcript | passed | Matches the supplied result |
| [example-018](09-1-3-formulating-abstractions-with-higher-order-procedures.md#example-018) | Exercise 1.34 | passed | Matches the supplied result |
| [example-019](09-1-3-formulating-abstractions-with-higher-order-procedures.md#example-019) | Demonstration / transcript | passed | Matches the supplied result |
| [example-020](09-1-3-formulating-abstractions-with-higher-order-procedures.md#example-020) | Demonstration / transcript | passed | Matches the supplied result |
| [example-021](09-1-3-formulating-abstractions-with-higher-order-procedures.md#example-021) | Demonstration / transcript | passed | Matches the supplied result |
| [example-022](09-1-3-formulating-abstractions-with-higher-order-procedures.md#example-022) | Demonstration / transcript | passed | Matches the supplied result |
| [example-023](09-1-3-formulating-abstractions-with-higher-order-procedures.md#example-023) | Exercise 1.42 | passed | Matches the supplied result |
| [example-024](09-1-3-formulating-abstractions-with-higher-order-procedures.md#example-024) | Exercise 1.43 | error | Unbound variable `repeated' |
| [example-025](11-2-1-introduction-to-data-abstraction.md#example-025) | Demonstration / transcript | passed | Matches the supplied result |
| [example-026](11-2-1-introduction-to-data-abstraction.md#example-026) | Demonstration / transcript | passed | Matches the supplied result |
| [example-027](11-2-1-introduction-to-data-abstraction.md#example-027) | Demonstration / transcript | passed | Matches the supplied result |
| [example-028](11-2-1-introduction-to-data-abstraction.md#example-028) | Demonstration / transcript | passed | Matches the supplied result |
| [example-029](11-2-1-introduction-to-data-abstraction.md#example-029) | Demonstration / transcript | different | Expected: 2/3<br>Actual: 6/9 |
| [example-030](12-2-2-hierarchical-data-and-the-closure-property.md#example-030) | Demonstration / transcript | passed | Matches the supplied result |
| [example-031](12-2-2-hierarchical-data-and-the-closure-property.md#example-031) | Demonstration / transcript | passed | Matches the supplied result |
| [example-032](12-2-2-hierarchical-data-and-the-closure-property.md#example-032) | Demonstration / transcript | passed | Matches the supplied result |
| [example-033](12-2-2-hierarchical-data-and-the-closure-property.md#example-033) | Demonstration / transcript | passed | Matches the supplied result |
| [example-034](12-2-2-hierarchical-data-and-the-closure-property.md#example-034) | Exercise 2.17 | passed | Matches the supplied result |
| [example-035](12-2-2-hierarchical-data-and-the-closure-property.md#example-035) | Exercise 2.18 | passed | Matches the supplied result |
| [example-036](12-2-2-hierarchical-data-and-the-closure-property.md#example-036) | Exercise 2.19 | error | Unbound variable `no-more?' |
| [example-037](12-2-2-hierarchical-data-and-the-closure-property.md#example-037) | Exercise 2.20 | error | Unbound variable `same-parity' |
| [example-038](12-2-2-hierarchical-data-and-the-closure-property.md#example-038) | Demonstration / transcript | passed | Matches the supplied result |
| [example-039](12-2-2-hierarchical-data-and-the-closure-property.md#example-039) | Demonstration / transcript | passed | Matches the supplied result |
| [example-040](12-2-2-hierarchical-data-and-the-closure-property.md#example-040) | Exercise 2.21 | different | Expected: (1 4 9 16)<br>Actual: (16 9 4 1) |
| [example-041](12-2-2-hierarchical-data-and-the-closure-property.md#example-041) | Exercise 2.23 | passed | Matches the supplied result |
| [example-042](12-2-2-hierarchical-data-and-the-closure-property.md#example-042) | Demonstration / transcript | passed | Matches the supplied result |
| [example-043](12-2-2-hierarchical-data-and-the-closure-property.md#example-043) | Exercise 2.27 | error | Unbound variable `deep-reverse' |
| [example-044](12-2-2-hierarchical-data-and-the-closure-property.md#example-044) | Exercise 2.28 | error | Unbound variable `fringe' |
| [example-045](12-2-2-hierarchical-data-and-the-closure-property.md#example-045) | Demonstration / transcript | passed | Matches the supplied result |
| [example-046](12-2-2-hierarchical-data-and-the-closure-property.md#example-046) | Exercise 2.30 | error | Expecting number got nil |
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
| [example-057](13-2-3-symbolic-data.md#example-057) | Demonstration / transcript | different | Expected: 1<br>y<br>(+ (* x y) (* y (+ x 3)))<br>Actual: (+ 1 0)<br>(+ (* x 0) (* 1 y))<br>(+ (* (* x y) (+ 1 0)) (* (+ (* x 0) (* 1 y)) (+ x 3))) |
| [example-058](14-2-4-multiple-representations-for-abstract-data.md#example-058) | Exercise 2.73 | passed | Matches the supplied result |
| [example-059](17-3-1-assignment-and-local-state.md#example-059) | Demonstration / transcript | passed | Matches the supplied result |
| [example-060](17-3-1-assignment-and-local-state.md#example-060) | Demonstration / transcript | passed | Matches the supplied result |
| [example-061](17-3-1-assignment-and-local-state.md#example-061) | Demonstration / transcript | passed | Matches the supplied result |
| [example-062](17-3-1-assignment-and-local-state.md#example-062) | Exercise 3.1 | error | Unbound variable `make-accumulator' |
| [example-063](17-3-1-assignment-and-local-state.md#example-063) | Exercise 3.2 | error | Unbound variable `*table*' |
| [example-064](17-3-1-assignment-and-local-state.md#example-064) | Exercise 3.3 | error | Unknown request - - MAKE-ACCOUNT |
| [example-065](17-3-1-assignment-and-local-state.md#example-065) | Demonstration / transcript | passed | Matches the supplied result |
| [example-066](17-3-1-assignment-and-local-state.md#example-066) | Demonstration / transcript | passed | Matches the supplied result |
| [example-067](17-3-1-assignment-and-local-state.md#example-067) | Demonstration / transcript | passed | Matches the supplied result |
| [example-068](18-3-2-the-environment-model-of-evaluation.md#example-068) | Demonstration / transcript | passed | Matches the supplied result |
| [example-069](18-3-2-the-environment-model-of-evaluation.md#example-069) | Demonstration / transcript | passed | Matches the supplied result |
| [example-070](18-3-2-the-environment-model-of-evaluation.md#example-070) | Exercise 3.11 | passed | Matches the supplied result |
| [example-071](19-3-3-modeling-with-mutable-data.md#example-071) | Exercise 3.12 | different | Expected: (a b c d)<br><response><br>Actual: (a b c d)<br>(b) |
| [example-072](19-3-3-modeling-with-mutable-data.md#example-072) | Exercise 3.12 | different | Expected: (a b c d)<br><response><br>Actual: (a b c d)<br>(b c d) |
| [example-073](19-3-3-modeling-with-mutable-data.md#example-073) | Demonstration / transcript | passed | Matches the supplied result |
| [example-074](19-3-3-modeling-with-mutable-data.md#example-074) | Exercise 3.20 | different | Expected: 17<br>Actual: 1 |
| [example-075](19-3-3-modeling-with-mutable-data.md#example-075) | Exercise 3.21 | passed | Matches the supplied result |
| [example-076](19-3-3-modeling-with-mutable-data.md#example-076) | Demonstration / transcript | error | Unbound variable `or-gate' |
| [example-077](19-3-3-modeling-with-mutable-data.md#example-077) | Demonstration / transcript | passed | Matches the supplied result |
| [example-078](19-3-3-modeling-with-mutable-data.md#example-078) | Demonstration / transcript | error | Unbound variable `or-gate' |
| [example-079](19-3-3-modeling-with-mutable-data.md#example-079) | Demonstration / transcript | error | Unbound variable `or-gate' |
| [example-080](19-3-3-modeling-with-mutable-data.md#example-080) | Demonstration / transcript | passed | Matches the supplied result |
| [example-081](19-3-3-modeling-with-mutable-data.md#example-081) | Demonstration / transcript | different | Expected: Probe: Celsius temp = 25<br>Probe: Fahrenheit temp = 77<br>done<br>Actual: Probe: Celsius temp = 25<br>Probe: Fahrenheit temp = 77done |
| [example-082](19-3-3-modeling-with-mutable-data.md#example-082) | Demonstration / transcript | error | Contradiction |
| [example-083](19-3-3-modeling-with-mutable-data.md#example-083) | Demonstration / transcript | different | Expected: Probe: Celsius temp = ?<br>Probe: Fahrenheit temp = ?<br>done<br>Actual: Probe: Celsius temp = ?<br>Probe: Fahrenheit temp = ?done |
| [example-084](19-3-3-modeling-with-mutable-data.md#example-084) | Demonstration / transcript | error | Contradiction |
| [example-085](20-3-4-concurrency-time-is-of-the-essence.md#example-085) | Demonstration / transcript | passed | Matches the supplied result |
| [example-086](21-3-5-streams.md#example-086) | Demonstration / transcript | passed | Matches the supplied result |
| [example-087](21-3-5-streams.md#example-087) | Demonstration / transcript | passed | Matches the supplied result |
| [example-088](21-3-5-streams.md#example-088) | Demonstration / transcript | error | Execution exceeded the time limit |
| [example-089](21-3-5-streams.md#example-089) | Demonstration / transcript | error | Unbound variable `partial-sums' |
| [example-090](21-3-5-streams.md#example-090) | Demonstration / transcript | error | Unbound variable `partial-sums' |
| [example-091](21-3-5-streams.md#example-091) | Demonstration / transcript | error | Unbound variable `partial-sums' |
| [example-092](21-3-5-streams.md#example-092) | Demonstration / transcript | different | Expected: 2.716924<br>Actual: 0.0 |
| [example-093](23-4-1-the-metacircular-evaluator.md#example-093) | Demonstration / transcript | different | Expected: ;;; M-Eval value:<br>ok<br>Actual:  |
| [example-094](23-4-1-the-metacircular-evaluator.md#example-094) | Demonstration / transcript | error | prompt is not defined |
| [example-095](24-4-2-variations-on-a-scheme-lazy-evaluation.md#example-095) | Demonstration / transcript | error | prompt is not defined |
| [example-096](24-4-2-variations-on-a-scheme-lazy-evaluation.md#example-096) | Exercise 4.30 | different | Expected: ;;; L-Eval input:<br>(square (id 10))<br>;;; L-Eval value:<br>response<br>;;; L-Eval input:<br>count<br>;;; L-Eval value:<br>response<br>Actual:  |
| [example-097](24-4-2-variations-on-a-scheme-lazy-evaluation.md#example-097) | Exercise 4.31 | different | Expected: 57<br>321<br>88<br>;;; L-Eval value:<br>done<br>Actual: 57<br>321<br>88 |
| [example-098](24-4-2-variations-on-a-scheme-lazy-evaluation.md#example-098) | Demonstration / transcript | error | Unbound variable `ones' |
| [example-099](24-4-2-variations-on-a-scheme-lazy-evaluation.md#example-099) | Demonstration / transcript | different | Expected: ;;; L-Eval input:<br>      (list-ref (solve (lambda (x) x) 1 0.001) 1000)<br>      ;;; L-Eval value:<br>      2.716924<br>Actual:  |
| [example-100](25-4-3-variations-on-a-scheme-nondeterministic-computing.md#example-100) | Demonstration / transcript | error | Unbound variable `amb' |
| [example-101](25-4-3-variations-on-a-scheme-nondeterministic-computing.md#example-101) | Demonstration / transcript | error | Unbound variable `amb' |
| [example-102](25-4-3-variations-on-a-scheme-nondeterministic-computing.md#example-102) | Demonstration / transcript | error | Unbound variable `try-again' |
| [example-103](25-4-3-variations-on-a-scheme-nondeterministic-computing.md#example-103) | Demonstration / transcript | error | Unbound variable `try-again' |
| [example-104](25-4-3-variations-on-a-scheme-nondeterministic-computing.md#example-104) | Demonstration / transcript | error | Unbound variable `amb' |
| [example-105](25-4-3-variations-on-a-scheme-nondeterministic-computing.md#example-105) | Demonstration / transcript | different | Expected: ;;; Starting a new problem<br>;;; Amb-Eval value:<br>(sentence (noun-phrase (article the) (noun cat)) (verb eats))<br>Actual: (sentence (noun-phrase (article the) (noun cat)) (verb eats)) |
| [example-106](25-4-3-variations-on-a-scheme-nondeterministic-computing.md#example-106) | Exercise 4.52 | error | Unbound variable `amb' |
| [example-107](25-4-3-variations-on-a-scheme-nondeterministic-computing.md#example-107) | Exercise 4.53 | error | Unbound variable `if-fail' |
| [example-108](26-4-4-logic-programming.md#example-108) | Demonstration / transcript | error | Unbound variable `append-to-form' |
| [example-109](26-4-4-logic-programming.md#example-109) | Demonstration / transcript | error | Unbound variable `append-to-form' |
| [example-110](26-4-4-logic-programming.md#example-110) | Demonstration / transcript | error | Unbound variable `append-to-form' |
| [example-111](29-5-2-a-register-machine-simulator.md#example-111) | Demonstration / transcript | passed | Matches the supplied result |
| [example-112](31-5-4-the-explicit-control-evaluator.md#example-112) | Demonstration / transcript | error | Unbound variable `eceval' |
| [example-113](32-5-5-compilation.md#example-113) | Exercise 5.41 | error | Unbound variable `find-variable' |
| [example-114](32-5-5-compilation.md#example-114) | Demonstration / transcript | error | Unbound variable `empty-instruction-sequence' |
| [example-115](32-5-5-compilation.md#example-115) | Demonstration / transcript | different | Expected: ;;; EC-Eval value:<br>120<br>Actual: 120 |
| [example-116](32-5-5-compilation.md#example-116) | Demonstration / transcript | error | Unbound variable `empty-instruction-sequence' |
| [example-117](32-5-5-compilation.md#example-117) | Demonstration / transcript | different | Expected: (total-pushes = 31 maximum-depth = 14)<br>;;; EC-Eval value:<br>120<br>Actual: 120 |
| [example-118](32-5-5-compilation.md#example-118) | Exercise 5.48 | error | Unbound variable `compile-and-run' |
| [example-119](32-5-5-compilation.md#example-119) | Exercise 5.48 | different | Expected: ;;; EC-Eval value:<br>120<br>Actual: 120 |

## Reproduce

Run pnpm adapt, then node packages/sicp/scripts/verify.mjs and node packages/sicp/scripts/audit.mjs from the repository root. verification.json contains the complete actual and expected outputs. No browser execution is triggered when a page opens.
