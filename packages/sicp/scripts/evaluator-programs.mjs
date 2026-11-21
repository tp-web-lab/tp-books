import { readFileSync } from "node:fs";
const snippets = JSON.parse(
	readFileSync(new URL("../source/snippets.json", import.meta.url)),
);
const code = (name) => {
	const s = snippets.find((s) => s.name === name && !s.excluded);
	if (!s) throw Error("Missing book snippet " + name);
	return s.code;
};
const baseNames = [
	"eval_scheme",
	"apply",
	"list_of_values",
	"eval_if",
	"eval_sequence",
	"eval_assignment",
	"eval_definition",
	"is_literal",
	"variable",
	"quoted",
	"tagged_list",
	"assignment",
	"definition_scheme",
	"lambda",
	"if",
	"begin",
	"sequence_exp",
	"application",
	"cond",
	"true",
	"make_procedure",
	"enclosing_environment",
	"make_frame",
	"extend_environment",
	"lookup_variable_value",
	"assign_name_value",
	"define_variable",
	"setup_environment",
	"primitive_procedure",
	"apply_primitive_procedure",
	"primitive_procedures",
];
export function evaluator(kind, forms) {
	let base = baseNames.map(code).join("\n\n");
	const unnamed = snippets
		.filter(
			(s) =>
				!s.name &&
				s.file === "chapter4/section1/subsection2.xml" &&
				/^\(define \(make-(lambda|if)/.test(s.code),
		)
		.map((s) => s.code)
		.join("\n");
	const primitiveNames =
		"car cdr cadr caddr cons null? pair? list + - * / = < > <= >= remainder abs sqrt not eq? equal? number? symbol? even? odd? memq display newline read write".split(
			" ",
		);
	let result = `; Original SICP evaluator, supplied in full so this cell is independent.\n(define apply-in-underlying-scheme apply)\n(define true #t)\n(define false #f)\n${base}\n${unnamed}\n(define primitive-procedures (list ${primitiveNames.map((n) => `(list (string->symbol "${n}") ${n})`).join(" ")}))\n`;
	if (kind === "lazy") {
		const evalCode = code("eval_scheme").replace(
			/\(apply \(eval \(operator exp\) env\)\s*\(list-of-values \(operands exp\) env\)\)/,
			"(apply (actual-value (operator exp) env) (operands exp) env)",
		);
		result +=
			"\n" +
			evalCode +
			"\n" +
			[
				"actual_value_lazy",
				"apply_lazy",
				"list_of_arg_values",
				"eval_if_lazy",
				"delay_it_lazy",
				"force_it_lazy",
			]
				.map(code)
				.join("\n");
	}
	if (kind === "amb") {
		result +=
			"\n" +
			snippets
				.filter(
					(s) =>
						s.file === "chapter4/section3/subsection3.xml" &&
						s.name &&
						s.name !== "driver_loop_amb" &&
						s.code.startsWith("(define"),
				)
				.map((s) => s.code)
				.join("\n");
		result +=
			"\n" +
			snippets.find(
				(s) =>
					s.file === "chapter4/section3/subsection3.xml" &&
					!s.name &&
					s.code.startsWith("(define (analyze-sequence"),
			).code;
		result += "\n" + code("analyze_quoted"); // quoted analysis needs the CPS variant below
		result += `\n(define (analyze-quoted exp) (let ((value (text-of-quotation exp))) (lambda (env succeed fail) (succeed value fail))))`;
	}
	result +=
		"\n" +
		readFileSync(
			new URL("scheme/evaluator-storage.scm", import.meta.url),
			"utf8",
		);
	return result + "\n(define the-global-environment (setup-environment))\n";
}
export { code as bookSnippet };
export function queryEvaluator() {
	const first = snippets.findIndex((s) => s.name === "instantiate");
	const last = snippets.findIndex((s) => s.name === "make_binding");
	return `
(define false #f)
(define true #t)
(define the-empty-stream '())
(define-syntax cons-stream (syntax-rules () ((_ a b) (cons a (delay b)))))
(define (stream-car s) (car s))
(define (stream-cdr s) (force (cdr s)))
(define (stream-null? s) (null? s))
(define (stream-append a b) (if (stream-null? a) b (cons-stream (stream-car a) (stream-append (stream-cdr a) b))))
(define (stream-map f s) (if (stream-null? s) the-empty-stream (cons-stream (f (stream-car s)) (stream-map f (stream-cdr s)))))
(define (stream-for-each f s) (if (not (stream-null? s)) (begin (f (stream-car s)) (stream-for-each f (stream-cdr s)))))
(define dispatch-table '())
(define (get k1 k2) (let ((entry (assoc (list k1 k2) dispatch-table))) (if entry (cdr entry) #f)))
(define (put k1 k2 value) (set! dispatch-table (cons (cons (list k1 k2) value) dispatch-table)))
${code("tagged_list")}
${snippets
	.slice(first, last + 1)
	.filter((s) => s.name && s.name !== "add_assertion")
	.map((s) => s.code)
	.join("\n")}
(put 'and 'qeval conjoin)
(put 'or 'qeval disjoin)
(put 'not 'qeval negate)
(put 'lisp-value 'qeval lisp-value)
(define (query-run expression)
  (let ((q (query-syntax-process expression)))
    (display ";;; Query results:") (newline)
    (stream-for-each (lambda (frame) (write (instantiate q frame (lambda (v f) (contract-question-mark v)))) (newline))
      (qeval q (singleton-stream '())))))
`;
}
export function registerMachine(forms) {
	const simulator = snippets.filter(
		(s) =>
			s.file.startsWith("chapter5/section2") &&
			!s.excluded &&
			s.code.startsWith("(define") &&
			s.name !== "gcd_machine" &&
			!s.name?.includes("alternative"),
	);
	// Retain the complete dispatcher, not the earlier incomplete sketch.
	const defs = new Map();
	for (const s of simulator)
		for (const f of forms(s.code)) {
			const name = f.match(/^\(define\s+(?:\(\s*)?([^\s()]+)/)?.[1];
			if (name && !f.includes("$\\")) defs.set(name, f);
		}
	const compiler = snippets.filter(
		(s) =>
			s.file.startsWith("chapter5/section5") &&
			s.name &&
			!s.excluded &&
			s.code.startsWith("(define") &&
			!["compile_and_go", "start_eceval", "user_print_2"].includes(s.name),
	);
	const fragments = [];
	const labels = new Set();
	for (const s of snippets.filter(
		(s) =>
			s.file.startsWith("chapter5/section4") &&
			!s.name &&
			!s.excluded &&
			/^(eval-dispatch|ev-|apply-dispatch|primitive-apply|compound-apply)/.test(
				s.code,
			),
	)) {
		const label = s.code.split(/\s/)[0];
		if (labels.has(label)) continue;
		labels.add(label);
		fragments.push(
			label === "apply-dispatch"
				? snippets.find(
						(s) =>
							s.file.startsWith("chapter5/section5") &&
							s.code.startsWith("apply-dispatch"),
					).code
				: s.code,
		);
	}
	const controller = `(assign continue (label machine-finished))\n${fragments.join("\n")}\nunknown-expression-type\nunknown-procedure-type\n(perform (op machine-error))\nmachine-finished`;
	const operations = new Set(
		[...controller.matchAll(/\(op ([^()\s]+)\)/g)].map((m) => m[1]),
	);
	for (const n of [
		"make-compiled-procedure",
		"compiled-procedure-entry",
		"compiled-procedure-env",
		"false?",
		"cons",
		"list",
		"define-variable!",
		"lookup-variable-value",
		"set-variable-value!",
	])
		operations.add(n);
	return (
		evaluator("strict", forms) +
		"\n(define apply apply-in-underlying-scheme)\n" +
		[...defs.values()].join("\n") +
		"\n" +
		compiler.map((s) => s.code).join("\n") +
		`
(define (empty-instruction-sequence) (make-instruction-sequence '() '() '()))
(define (empty-arglist) '())
(define (adjoin-arg arg arglist) (append arglist (list arg)))
(define (last-operand? ops) (null? (cdr ops)))
(define (machine-error) (error "Unknown expression or procedure in EC evaluator"))
(define (make-compiled-procedure entry env) (lambda (key) (case key ((tag) 'compiled-procedure) ((entry) entry) ((env) env))))
(define (compiled-procedure? p) (and (procedure? p) (eq? (p 'tag) 'compiled-procedure)))
(define (compiled-procedure-entry p) (p 'entry))
(define (compiled-procedure-env p) (p 'env))
(define machine (make-machine '(exp env val proc argl continue unev) (list ${[...operations].map((n) => `(list (string->symbol "${n}") ${n})`).join(" ")}) '(${controller})))
(define evaluator-instructions (assemble '(${controller}) machine))
(define (machine-value expression compiled statistics show)
  ((machine 'stack) 'initialize)
  (set-register-contents! machine 'env the-global-environment)
  (set-register-contents! machine 'continue '())
  (set-register-contents! machine 'exp expression)
  ((machine 'install-instruction-sequence)
    (if compiled (assemble (statements (compile expression 'val 'return)) machine) evaluator-instructions))
  (start machine)
  (if show (begin
    (if statistics (begin ((machine 'stack) 'print-statistics) (newline)))
    (display ";;; EC-Eval value:") (newline)
    (write (get-register-contents machine 'val)) (newline))))
(define (ec-input expression)
  (display ";;; EC-Eval input:") (newline) (write expression) (newline)
  (machine-value expression #f #f #t))
`
	);
}
