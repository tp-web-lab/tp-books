import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { linkUnmarkedCitations } from "./bibliography-links.mjs";
const root = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");
const b = JSON.parse(read("bibliography.json")),
	pages = JSON.parse(read("pages.json"));
test("Linked edition retains canonical text, including citation wording", () => {
	assert.equal(b.canonicalTextSha256, b.linkedTextSha256);
	assert.equal(
		b.canonicalTextSha256,
		createHash("sha256")
			.update(read("source/sicp-canonical.md").replace(/\s+/g, " ").trim())
			.digest("hex"),
	);
});
test("Each citation has exactly one local definition and a local bibliography", () => {
	let count = 0;
	for (const page of pages.filter((p) => p.title !== "References")) {
		const text = read("public/docs/" + page.file);
		const citations = [...text.matchAll(/:tp-ref:\{href="@([^"]+)"/g)].map(
			(m) => m[1],
		);
		count += citations.length;
		const definitions = [
			...text.matchAll(/::: tp-biblio \{ref="([^"]+)"/g),
		].map((m) => m[1]);
		assert.deepEqual(
			[...new Set(citations)].sort(),
			definitions.sort(),
			page.file,
		);
		assert.equal(definitions.length, new Set(definitions).size);
		assert.equal(
			text.includes('::: tp-listof {selector="tp-biblio"}'),
			citations.length > 0,
		);
	}
	assert.equal(count, b.citations.length);
	assert.ok(
		b.citations.some((c) => c.origin === "Reviewed plain-text citation"),
	);
});
test("Global References retains uncited notices and identifies supplemental sources", () => {
	const text = read("public/docs/33-references.md");
	const keys = [...text.matchAll(/::: tp-biblio \{ref="([^"]+)"/g)].map(
		(m) => m[1],
	);
	assert.deepEqual(
		keys.sort(),
		b.entries
			.filter((e) => !b.citations.some((c) => c.key === e.key))
			.map((e) => e.key)
			.sort(),
	);
	assert.equal(new Set(keys).size, keys.length);
	assert.ok(text.includes('::: tp-global-listof {selector="tp-biblio" merge}'));
	assert.ok(!text.includes("::: tp-listof "));
	assert.equal(b.entries.filter((e) => e.supplemental).length, 8);
	const all = pages.flatMap((p) =>
		[
			...read("public/docs/" + p.file).matchAll(
				/::: tp-biblio \{ref="([^"]+)"/g,
			),
		].map((m) => m[1]),
	);
	assert.equal(new Set(all).size, b.entries.length);
	for (const c of b.citations) assert.ok(all.includes(c.key), c.key);
});
test("Reviewed plain citations do not alter code or historical dates", () => {
	const input =
		'Since 1980. IEEE 1990.\n```scheme\n(display "IEEE 1990")\n```\n# References\n';
	const result = linkUnmarkedCitations(input, b.entries);
	assert.ok(result.markdown.startsWith("Since 1980. :tp-ref:"));
	assert.ok(result.markdown.includes('```scheme\n(display "IEEE 1990")\n```'));
	assert.equal(result.citations.length, 1);
});
