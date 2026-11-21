import {
	evaluator,
	bookSnippet,
	queryEvaluator,
	registerMachine,
} from "./evaluator-programs.mjs";
import { readFileSync } from "node:fs";
const helper = (name) =>
	readFileSync(new URL(`scheme/${name}.scm`, import.meta.url), "utf8");
export function adaptExecution(item, { definitions, forms, group }) {
	const n = Number(item.id.slice(-3));
	if ([36, 99].includes(n)) item.timeout = 120000;
	const add = (code, note) => {
		item.program += "\n\n; TP adaptation: " + note + "\n" + code;
		item.adaptation = note;
	};
	const set = (code, query, note) => {
		item.program = "; TP adaptation: " + note + "\n" + code;
		item.query = query;
		item.adaptation = note;
	};
	const named = (name, test = () => true) =>
		definitions.find((d) => d.name === name && test(d.code))?.code ?? "";
	const solution = {
		24: "repeated",
		36: "coins",
		37: "parity",
		40: "square-list",
		43: "deep-reverse",
		44: "fringe",
		46: "tree-map",
		62: "accumulator",
		113: "find-variable",
	};
	if (solution[n] && [62].includes(n)) {
		item.program = helper(solution[n]) + "\n" + item.program;
	}
	if (solution[n])
		add(
			helper(solution[n]),
			"Editable reference implementation supplied by TP for this exercise; not original book text.",
		);
	if (n === 29)
		add(
			named("make-rat", (c) => c.includes("(gcd n d)")),
			"Use the reduced-fraction constructor introduced immediately before this example.",
		);
	if (n === 57)
		add(
			named("make-sum", (c) => c.includes("(cond")) +
				"\n" +
				named("make-product", (c) => c.includes("(cond")),
			"Use the simplified constructors, not the earlier unsimplified versions.",
		);
	if (n === 63)
		set(
			helper("monitored") + "\n(define s (make-monitored sqrt))",
			"(begin (write (s 100)) (newline) (s 'how-many-calls?))",
			"TP reference implementation of make-monitored; use the Scheme numeric square root, not the symbolic derivative example.",
		);
	if (n === 64)
		set(
			helper("account") + "\n(define acc (make-account 100 'secret-password))",
			"(begin (write ((acc 'secret-password 'withdraw) 40)) (newline) ((acc 'some-other-password 'deposit) 50))",
			"TP reference implementation of the password-protected account exercise.",
		);
	if (n === 74)
		add(
			"(define z (cons x x))\n(set-car! (cdr z) 17)",
			"Replay the mutation preceding this query in the book.",
		);
	if ([76, 78, 79].includes(n)) {
		item.program = helper("or-gate") + "\n" + item.program;
		item.adaptation =
			"Supply the or-gate exercise used by the book’s half-adder; preserve agenda and propagation times.";
	}
	if (n === 84)
		add(
			"(forget-value! C 'user)",
			"Replay the successful retraction before assigning Fahrenheit.",
		);
	if (n === 82) {
		add(
			`(define original-error error)
(define (error message . details)
  (display "Error! ") (display message) (display " ")
  (write (if (= (length details) 1) (car details) details)) (newline)
  (original-error message))`,
			"Retain the conflicting values in the expected contradiction diagnostic.",
		);
		item.expectedError = { message: "Contradiction", details: [77, 212] };
		item.adaptation =
			"This example intentionally demonstrates a contradiction; the error is the expected result.";
	}
	if ([78, 79, 81, 83, 84].includes(n)) {
		const original = item.query;
		add(
			`(define (run-result) (let ((result ${original})) (newline) result))`,
			"Keep the returned status on a separate line from probe output.",
		);
		item.query = "(run-result)";
	}
	if ([88, 89, 90, 91, 92].includes(n)) {
		item.program = helper("streams") + "\n" + item.program;
		add(
			helper("streams"),
			"Variadic stream-map and partial-sums; print only the finite prefix shown in the book, not an infinite stream.",
		);
		if (n <= 91) {
			const expr = {
				88: "(sqrt-stream 2)",
				89: "pi-stream",
				90: "(euler-transform pi-stream)",
				91: "(accelerated-sequence euler-transform pi-stream)",
			}[n];
			const count = n === 88 ? 5 : 8;
			// State-dependent stream definitions must be rebuilt after correcting stream-map.
			if (n >= 89)
				add(
					"(define pi-stream (scale-stream (partial-sums (pi-summands 1)) 4))",
					"Initialize the pi stream after installing partial-sums.",
				);
			item.query = `(show-prefix ${expr} ${count})`;
		}
	}
	if (n === 71) item.exerciseResults = "(a b c d)\n(b)";
	if (n === 72) item.exerciseResults = "(a b c d)\n(b c d)";
	if (n >= 93 && n <= 99) {
		const lazy = n >= 95;
		let code =
			evaluator(lazy ? "lazy" : "strict", forms) + helper("evaluator-bridge");
		let query;
		if (n === 93)
			query =
				"(m-run '(define (append x y) (if (null? x) y (cons (car x) (append (cdr x) y)))))";
		if (n === 94) {
			code +=
				"\n(eval '(define (append x y) (if (null? x) y (cons (car x) (append (cdr x) y)))) the-global-environment)";
			query = "(m-run '(append '(a b c) '(d e f)))";
		}
		if (n === 95) query = "(l-input '(define (try a b) (if (= a 0) 1 b)))";
		if (n === 96) {
			code +=
				"\n(actual-value '(define count 0) the-global-environment)\n(actual-value '(define (id x) (set! count (+ count 1)) x) the-global-environment)\n(actual-value '(define (square x) (* x x)) the-global-environment)";
			query = "(begin (l-input '(square (id 10))) (l-input 'count))";
			item.exerciseResults =
				";;; L-Eval input: (square (id 10)) ;;; L-Eval value: 100 ;;; L-Eval input: count ;;; L-Eval value: 1";
		}
		if (n === 97) {
			code +=
				"\n(actual-value '" +
				bookSnippet("exercise_4_30_b") +
				" the-global-environment)";
			query =
				"(l-run '(for-each (lambda (x) (newline) (display x)) (list 57 321 88)))";
		}
		if (n >= 98) {
			for (const form of forms(
				bookSnippet("pair_lazy") + "\n" + bookSnippet("list_library_lazy"),
			)) {
				if (form.startsWith("(define"))
					code += "\n(actual-value '" + form + " the-global-environment)";
			}
			if (n === 98) query = "(l-run '(list-ref integers 17))";
			else {
				for (const form of forms(bookSnippet("lazy_integral"))) {
					code += "\n(actual-value '" + form + " the-global-environment)";
				}
				query = "(l-input '(list-ref (solve (lambda (x) x) 1 0.001) 1000))";
			}
		}
		set(
			code,
			query,
			"Run the original " +
				(lazy ? "lazy" : "metacircular") +
				" evaluator with a finite, editable input sequence instead of entering a blocking read loop.",
		);
	}
	if (n === 99) {
		const code = `(define-syntax cons-stream (syntax-rules () ((_ a b) (cons a (delay b)))))
(define (stream-car s) (car s))
(define (stream-cdr s) (force (cdr s)))
(define (scale-stream s factor) (stream-map (lambda (x) (* x factor)) s))
(define (list-ref s n) (if (= n 0) (stream-car s) (list-ref (stream-cdr s) (- n 1))))
${helper("streams")}
${bookSnippet("integral")}
${bookSnippet("solve")}
(define (run-lazy-integral)
  (display ";;; L-Eval input:") (newline)
  (write '(list-ref (solve (lambda (x) x) 1 0.001) 1000)) (newline)
  (display ";;; L-Eval value:") (newline)
  (list-ref (solve (lambda (x) x) 1 0.001) 1000))`;
		set(
			code,
			"(run-lazy-integral)",
			"For this 1,000-step calculation, express lazy pairs with explicit delay/force using the equivalent integral and solve definitions from section 3.5.4. This avoids evaluating every numeric step twice; the recurrence, step size and computed result are unchanged. The preceding cell demonstrates the complete lazy evaluator.",
		);
	}
	if (n >= 100 && n <= 107) {
		let code = evaluator("amb", forms) + helper("amb-bridge");
		const init = (src) => {
			for (const form of forms(src)) code += "\n(amb-load '" + form + ")";
		};
		init(bookSnippet("require_non_det") + "\n" + bookSnippet("an_element_of"));
		init(
			"(define (prime? n) (define (test d) (cond ((> (* d d) n) true) ((= (remainder n d) 0) false) (else (test (+ d 1))))) (if (< n 2) false (test 2)))",
		);
		init(bookSnippet("prime_sum_pair_non_det"));
		const problem = "'(prime-sum-pair '(1 3 5 8) '(20 35 110))";
		let query = `(amb-run ${problem} #t)`;
		if (n === 102 || n === 103) {
			code += `\n(set! show-answer #f)\n(amb-run ${problem} #f)\n${n === 103 ? "(amb-next #f)" : ""}\n(set! show-answer #t)`;
			query =
				n === 102 ? "(amb-next #f)" : "(begin (amb-next #f) (amb-next #t))";
		}
		if (n === 104)
			query = "(amb-run '(prime-sum-pair '(19 27 30) '(11 36 58)) #t)";
		if (n === 105) {
			for (const name of [
				"nouns",
				"parse_sentence",
				"parse_noun_phrase",
				"parse_word",
				"unparsed",
				"parse_input",
			])
				init(bookSnippet(name));
			query = "(amb-run '(parse '(the cat eats)) #t)";
		}
		if (n === 106) {
			init("(define count 0)");
			query =
				"(begin (amb-run '(let ((x (an-element-of '(a b c))) (y (an-element-of '(a b c)))) (permanent-set! count (+ count 1)) (require (not (eq? x y))) (list x y count)) #t) (amb-next #t))";
		}
		if (n === 107)
			query =
				"(begin (amb-run '(if-fail (let ((x (an-element-of '(1 3 5)))) (require (even? x)) x) 'all-odd) #t) (display \";;; Amb-Eval input:\") (newline) (amb-run '(if-fail (let ((x (an-element-of '(1 3 5 8)))) (require (even? x)) x) 'all-odd) #t))";
		set(
			code,
			query,
			"Use the book’s nondeterministic evaluator with saved failure continuations; TP supplies the let, permanent-set! and if-fail exercise extensions.",
		);
	}
	if (n >= 108 && n <= 110) {
		let code = queryEvaluator();
		for (const form of forms(bookSnippet("append_to_form")).reverse())
			code += "\n(add-rule-or-assertion! (query-syntax-process '" + form + "))";
		set(
			code,
			"(query-run '" + item.query + ")",
			"Execute the original stream-based query evaluator and append-to-form rules, with a finite driver.",
		);
	}
	if (n === 112 || n >= 114) {
		let code = registerMachine(forms),
			query;
		const factorial =
			"'(define (factorial n) (if (= n 1) 1 (* (factorial (- n 1)) n)))";
		if (n === 112)
			query =
				"(begin (ec-input '(define (append x y) (if (null? x) y (cons (car x) (append (cdr x) y))))) (ec-input '(append '(a b c) '(d e f))))";
		else if ([114, 116, 118].includes(n))
			query = `(machine-value ${factorial} #t ${n === 116 ? "#t" : "#f"} #t)`;
		else {
			code += `\n(machine-value ${factorial} #t #f #f)`;
			query = `(machine-value '(factorial 5) #f ${n === 117 ? "#t" : "#f"} #t)`;
		}
		set(
			code,
			query,
			"Assemble the book’s register machine and compiler; a finite driver replaces read-eval-print-loop. Stack statistics are measured by the original instrumented stack.",
		);
	}
	if (n >= 88 || n === 36) {
		item.program =
			"; TP: evaluator objects hide cyclic environments; skip LIPS pair instrumentation for these acyclic runtime values.\n#!no-cycle\n#!no-promise\n" +
			item.program;
		item.timeout = 120000;
	}
	return item;
}
