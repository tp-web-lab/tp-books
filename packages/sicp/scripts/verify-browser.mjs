import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { chromium } from "@playwright/test";
import { compareResult } from "./compare-results.mjs";
const root = new URL("../", import.meta.url);
const examples = JSON.parse(readFileSync(new URL("examples.json", root)));
const ids = process.env.SICP_IDS?.split(",");
const browser = await chromium.launch();
const page = await browser.newPage();
await page.routeWebSocket("**", () => {});
const results = ids
	? JSON.parse(readFileSync(new URL("browser-verification.json", root)))
	: [];
const base = process.env.BOOK_URL ?? "http://127.0.0.1:4340/";
let currentPage;
try {
	for (const item of examples.filter((e) => !ids || ids.includes(e.id))) {
		console.log("Running", item.id);
		if (currentPage !== item.page) {
			await page.goto(base + "#/" + item.page);
			currentPage = item.page;
		}
		const el = page.locator("tp-scheme#" + item.id);
		await el.waitFor({ state: "attached", timeout: 30000 });
		const start = Date.now();
		const result = await el.evaluate(
			async (el, item) => {
				await customElements.whenDefined("tp-scheme");
				for (
					let i = 0;
					i < 200 &&
					(!el.querySelector(".tp-interpreter-output") ||
						el.getAttribute("aria-busy") === "true");
					i++
				)
					await new Promise((r) => setTimeout(r, 100));
				await new Promise((r) => setTimeout(r, 150));
				const editor = el.querySelector("tp-code-editor");
				const sourceMatches = editor?.getValue().trim() === item.program.trim();
				const queryMatches = el.getAttribute("query") === item.query;
				await el.run();
				const transcript =
					el.querySelector(".tp-interpreter-output")?.textContent ?? "";
				const marker = "> " + item.query + "\n";
				const at = transcript.indexOf(marker);
				const actual = (
					at >= 0 ? transcript.slice(at + marker.length) : transcript
				).trim();
				return {
					actual,
					transcript,
					sourceMatches,
					queryMatches,
					...(actual.includes("ERROR:")
						? { error: actual.slice(actual.indexOf("ERROR:") + 6).trim() }
						: {}),
					shadow: el.shadowRoot !== null,
				};
			},
			item,
			{ timeout: 180000 },
		);
		const comparison = compareResult(item, result);
		if (!result.sourceMatches || !result.queryMatches || result.shadow) {
			comparison.status = "error";
			comparison.reason =
				"The rendered cell does not preserve its verified source/query or light DOM.";
		}
		const previous = results.findIndex((r) => r.id === item.id);
		if (previous >= 0) results.splice(previous, 1);
		results.push({
			id: item.id,
			signature: createHash("sha256")
				.update(item.program + "\n" + item.query)
				.digest("hex"),
			...comparison,
			...result,
			milliseconds: Date.now() - start,
		});
		console.log(
			item.id,
			results.at(-1).status,
			JSON.stringify(result.actual).slice(0, 160),
		);
		results.sort((a, b) => a.id.localeCompare(b.id));
		writeFileSync(
			new URL("browser-verification.json", root),
			JSON.stringify(results, null, 2) + "\n",
		);
	}
	if (results.some((r) => ["error", "different"].includes(r.status)))
		process.exitCode = 1;
} finally {
	await browser.close();
}
