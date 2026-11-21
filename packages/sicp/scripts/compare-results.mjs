const normalize = (s) =>
	s
		.replace(/New value/g, "New-value")
		.trim()
		.replace(/\s+/g, " ");
function tokenize(s) {
	const tokens =
		normalize(s).match(/"(?:\\.|[^"\\])*"|[()'`]|[^\s()'`]+/g) ?? [];
	let i = 0;
	function datum() {
		const t = tokens[i++];
		if (t === "'") return ["(", "quote", ...datum(), ")"];
		if (t === "(") {
			const out = ["("];
			while (i < tokens.length && tokens[i] !== ")") out.push(...datum());
			if (tokens[i] === ")") out.push(tokens[i++]);
			return out;
		}
		return [t];
	}
	const out = [];
	while (i < tokens.length) out.push(...datum());
	return out;
}
const numeric = (t) => /^[-+]?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?$/i.test(t);
function sameNumber(expected, actual) {
	if (!numeric(expected) || !numeric(actual)) return false;
	const a = Number(expected),
		b = Number(actual);
	if (a === b) return true;
	// Half a unit in the last printed decimal, plus floating-point roundoff.
	// Integer results remain exact; no broad relative tolerance hides errors.
	const match = expected.match(/\.(\d+)(?:e([-+]?\d+))?$/i);
	if (!match) return false;
	const tolerance =
		0.5 * 10 ** ((Number(match[2]) || 0) - match[1].length) +
		Number.EPSILON * Math.max(1, Math.abs(a)) * 8;
	return Math.abs(a - b) <= tolerance;
}
export function compareResult(item, result) {
	if (item.expectedError)
		return result.error?.includes(item.expectedError.message) &&
			(item.expectedError.details ?? []).every((value) =>
				tokenize(result.actual ?? "").includes(String(value)),
			)
			? {
					status: "expected-error",
					reason: "The book intentionally raises this contradiction.",
				}
			: { status: "error", reason: "Expected contradiction was not raised." };
	if (result.error) return { status: "error" };
	const expected = item.exerciseResults ?? item.expected;
	if (normalize(expected) === normalize(result.actual))
		return { status: item.exerciseResults ? "exercise-result" : "passed" };
	const x = tokenize(expected),
		y = tokenize(result.actual);
	if (
		x.length === y.length &&
		x.every((v, i) => v === y[i] || sameNumber(v, y[i]))
	)
		return {
			status: item.exerciseResults ? "exercise-result" : "equivalent",
			reason:
				"Same values and structure; Scheme printing, spacing or printed numeric rounding differs.",
		};
	return { status: "different" };
}
