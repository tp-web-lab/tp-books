import { readFileSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const root = new URL("../", import.meta.url);
const pages = JSON.parse(readFileSync(new URL("pages.json", root)));
const bibliography = JSON.parse(
	readFileSync(new URL("bibliography.json", root)),
);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.routeWebSocket("**", () => {});
const base = process.env.BOOK_URL ?? "http://127.0.0.1:4340/";
const results = [];
try {
	for (const entry of pages.filter((p) => p.title !== "References")) {
		const source = readFileSync(
			new URL("public/docs/" + entry.file, root),
			"utf8",
		);
		const expected = [...source.matchAll(/:tp-ref:\{href="@([^\"]+)"/g)].map(
			(m) => m[1],
		);
		if (!expected.length) continue;
		await page.goto(base + "#/" + entry.file);
		await page.waitForFunction(
			({ count, title }) =>
				[...document.querySelectorAll("h1,h2")].some(
					(h) => h.textContent.trim() === title,
				) &&
				document.querySelector("tp-listof dl dt") &&
				document.querySelectorAll('tp-ref[href^="@"]').length === count &&
				[...document.querySelectorAll('tp-ref[href^="@"]')].every((r) =>
					r.querySelector("tp-tooltip")?.textContent.trim(),
				),
			{ count: expected.length, title: entry.title },
			{ timeout: 30000 },
		);
		const state = await page.evaluate(() => {
			const refs = [...document.querySelectorAll('tp-ref[href^="@"]')];
			return {
				count: refs.length,
				terms: document.querySelectorAll("tp-listof dl > dt").length,
				broken: refs
					.filter(
						(r) =>
							r.querySelector("tp-button")?.hasAttribute("disabled") ||
							!r.querySelector("tp-tooltip")?.textContent.trim() ||
							r.querySelector("tp-button")?.textContent !==
								r.getAttribute("label"),
					)
					.map((r) => r.getAttribute("href")),
			};
		});
		assert.equal(state.count, expected.length, entry.file);
		assert.equal(state.terms, new Set(expected).size, entry.file);
		assert.deepEqual(state.broken, []);
		const first = page.locator('tp-ref[href^="@"] button').first();
		await first.hover();
		await page
			.locator("tp-ref tp-tooltip[open]")
			.first()
			.waitFor({ state: "visible" });
		results.push({ page: entry.file, ...state, tooltip: true });
		console.log(entry.file, state.count, "citations, tooltip OK");
	}
	await page.goto(base + "#/33-references.md");
	await page.waitForFunction(
		(count) => {
			const el = document.querySelector("tp-global-listof");
			return (
				el &&
				!el.hasAttribute("aria-busy") &&
				el.querySelectorAll("dl[data-tp-global-bibliography] > dt").length ===
					count
			);
		},
		bibliography.entries.length,
		{ timeout: 120000 },
	);
	const global = await page.evaluate(() => ({
		lists: document.querySelectorAll(
			"tp-global-listof dl[data-tp-global-bibliography]",
		).length,
		terms: document.querySelectorAll(
			"tp-global-listof dl[data-tp-global-bibliography] > dt",
		).length,
		citations: document.querySelectorAll(
			"tp-global-listof a[data-tp-global-citation]",
		).length,
		failed:
			document.querySelector('tp-global-listof [role="status"]')?.textContent ??
			"",
	}));
	assert.equal(global.lists, 1);
	assert.equal(global.terms, bibliography.entries.length);
	assert.equal(global.citations, bibliography.citations.length);
	const link = page
		.locator("tp-global-listof a[data-tp-global-citation]")
		.first();
	const href = await link.getAttribute("href");
	await link.click();
	await page.waitForFunction(
		() => !location.hash.startsWith("#/33-references.md"),
	);
	const target = decodeURIComponent(href.split("#").at(-1));
	await page.waitForFunction((id) => !!document.getElementById(id), target);
	await page.goBack();
	await page.waitForFunction(() =>
		location.hash.startsWith("#/33-references.md"),
	);
	writeFileSync(
		new URL("bibliography-verification.json", root),
		JSON.stringify(
			{ pages: results, global, originLink: true, backHistory: true },
			null,
			2,
		) + "\n",
	);
	console.log(global, "origin link and Back OK");
} finally {
	await browser.close();
}
