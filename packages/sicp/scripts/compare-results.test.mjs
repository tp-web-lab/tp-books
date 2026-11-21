import test from "node:test";
import assert from "node:assert/strict";
import { compareResult } from "./compare-results.mjs";
test("Only book decimal precision permits numeric differences", () => {
	assert.equal(
		compareResult({ expected: "2.716924" }, { actual: "2.716923932235896" })
			.status,
		"equivalent",
	);
	assert.equal(
		compareResult({ expected: "2.716924" }, { actual: "2.716925" }).status,
		"different",
	);
	assert.equal(
		compareResult({ expected: "1000000" }, { actual: "1000001" }).status,
		"different",
	);
	assert.equal(
		compareResult({ expected: "(1 2)" }, { actual: "(1 3)" }).status,
		"different",
	);
	assert.equal(
		compareResult(
			{ expected: '"value 2.716924"' },
			{ actual: '"value 2.716923932"' },
		).status,
		"different",
	);
});
test("Expected contradictions do not conceal unrelated errors", () => {
	const item = { expectedError: { message: "Contradiction" } };
	assert.equal(
		compareResult(item, { error: "Error! Contradiction" }).status,
		"expected-error",
	);
	assert.equal(
		compareResult(item, { error: "Unbound variable" }).status,
		"error",
	);
	assert.equal(compareResult(item, { actual: "done" }).status, "error");
});
