import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { Worker } from "node:worker_threads";
import { compareResult } from "./compare-results.mjs";
const root = new URL("../", import.meta.url);
const read = (name) => JSON.parse(readFileSync(new URL(name, root)));
const examples = read("examples.json");
const accepted = new Set([
	"passed",
	"equivalent",
	"exercise-result",
	"expected-error",
]);
for (const id of [
	"example-036",
	"example-078",
	"example-079",
	"example-082",
	"example-096",
	"example-106",
	"example-110",
	"example-117",
]) {
	test(`${id}: corrected dependency, state or evaluator behavior`, {
		timeout: 120000,
	}, async () => {
		const item = examples.find((e) => e.id === id);
		const result = await new Promise((resolve, reject) => {
			const worker = new Worker(
				new URL("evaluate-worker.mjs", import.meta.url),
				{ workerData: item },
			);
			const timer = setTimeout(() => {
				worker.terminate();
				reject(Error("Execution timeout"));
			}, 100000);
			worker.once("message", (value) => {
				clearTimeout(timer);
				worker.terminate();
				resolve(value);
			});
			worker.once("error", (error) => {
				clearTimeout(timer);
				worker.terminate();
				reject(error);
			});
		});
		assert.ok(
			accepted.has(compareResult(item, result).status),
			JSON.stringify(result),
		);
		if (id === "example-117")
			assert.match(result.actual, /total-pushes = 31 maximum-depth = 14/);
		if (id === "example-082") assert.match(result.actual, /\(77 212\)/);
	});
}
test("All 119 cells have current successful worker and real tp-scheme browser records", () => {
	for (const filename of ["verification.json", "browser-verification.json"]) {
		const results = read(filename);
		assert.equal(results.length, examples.length, filename);
		for (const e of examples) {
			const r = results.find((r) => r.id === e.id);
			assert.equal(
				r?.signature,
				createHash("sha256")
					.update(e.program + "\n" + e.query)
					.digest("hex"),
				filename + ": " + e.id,
			);
			assert.ok(
				accepted.has(r.status),
				filename + ": " + e.id + " " + r.status,
			);
			if (filename.startsWith("browser")) {
				assert.equal(r.sourceMatches, true);
				assert.equal(r.queryMatches, true);
				assert.equal(r.shadow, false);
			} else assert.equal(r.expected, e.expected);
		}
	}
});
