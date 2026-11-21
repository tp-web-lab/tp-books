// Explicitly reviewed author-date citations that are plain text in the XML.
// Do not infer citations from arbitrary years or names in prose or programs.
export const restoredBibliography = [
	{
		key: "PIT83",
		label: "Pitman 1983",
		content:
			"Pitman, Kent. 1983. The revised MacLisp Manual (Saturday evening edition). Technical report 295, MIT Laboratory for Computer Science.",
	},
	{
		key: "TEI74",
		label: "Teitelman 1974",
		content:
			"Teitelman, Warren. 1974. Interlisp reference manual. Technical report, Xerox Palo Alto Research Center.",
	},
	{
		key: "STE82",
		label: "Steele 1982",
		content:
			"Steele, Guy Lewis, Jr. 1982. An overview of Common Lisp. In *Proceedings of the ACM Symposium on Lisp and Functional Programming*, pp. 98–107.",
	},
	{
		key: "STE90",
		label: "Steele 1990",
		content:
			"Steele, Guy Lewis, Jr. 1990. *Common Lisp: The Language*. 2nd edition. Digital Press.",
	},
].map((entry) => ({
	...entry,
	supplemental: true,
	provenance: "Restored from the bibliography of the original SICP edition.",
	source: "https://sarabander.github.io/sicp/html/References.xhtml",
}));
const rules = [
	["IEE90", "IEEE 1990"],
	["PIT83", "Pitman 1983"],
	["TEI74", "Teitelman 1974"],
	["STE82", "Steele 1982"],
	["STE90", "Steele 1990"],
	["Edwards 2019", "Edwards (2019)"],
	["Knuth 1997a", "Knuth (1997a)"],
	["Rivest 1977", "Rivest, Shamir, and Adleman (1977)"],
	["Church 1941", "Church (1941)"],
	["Hoare 1972", "Hoare (1972)"],
	["Liskov 1975", "Liskov and Zilles (1975)"],
	["Turner 1981", "Turner 1981"],
	["Waters 1979", "Waters (1979)"],
	["Knuth 1997b", "Knuth (1997b)"],
	["Zippel 1979", "Zippel (1979)"],
	["Zippel 1993", "Zippel's book (1993)", "1993"],
	["Borning 1977", "Borning (1977)"],
	["Sutherland 1963", "Sutherland (1963)"],
	["Dijkstra 1968b", "Dijkstra's classic exposition (1968b)", "1968b"],
	["Lamport 1978", "Lamport (1978)"],
	["Friedman 1976", "Friedman and Wise (1976)"],
	["Landin 1965", "Landin (1965)"],
	["Friedman 1992", "Friedman, Wand, and Haynes 1992"],
	[
		"Hofstadter 1979",
		"Hofstadter's beautiful book *Gödel, Escher, Bach* (1979)",
		"1979",
	],
	["Clinger 1982", "Clinger (1982)"],
	["Floyd 1967", "Floyd (1967)"],
	["Hewitt 1969", "Hewitt (1969)"],
	["McDermott 1972", "McDermott and Sussman (1972)"],
	["Sussman 1975", "Sussman and Stallman (1975)"],
	["Sussman 1971", "Sussman, Winograd, and Charniak (1971)"],
	["Clark 1978", "Clark (1978)"],
	["Green 1968", "Green and Raphael (1968)"],
	["Baker 1978", "Baker (1978)"],
	["Fenichel 1969", "Fenichel and Yochelson (1969)"],
	["Lieberman 1983", "Lieberman and Hewitt 1983"],
];
const escape = (value) =>
	value
		.replaceAll("&", "&amp;")
		.replaceAll('"', "&quot;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
export function linkUnmarkedCitations(markdown, entries) {
	const citations = [];
	const ref = (key, label) => {
		citations.push({ key, label, origin: "Reviewed plain-text citation" });
		return `:tp-ref:{href="@${key}" label="${escape(label)}"}`;
	};
	const at = markdown.indexOf("\n# References\n");
	if (at < 0) throw Error("Missing References section");
	const text = markdown
		.slice(0, at)
		.split(/(```[\s\S]*?```|:tp-ref:\{[^}]+\})/g)
		.map((part, i) => {
			if (i % 2) return part;
			for (const [target, phrase, yearOnly] of rules) {
				const entry = entries.find(
					(e) => e.key === target || e.label === target,
				);
				if (!entry) throw Error("Unknown bibliography target " + target);
				const pattern = phrase
					.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
					.replace(/ +/g, "\\s+");
				part = part.replace(new RegExp(pattern, "g"), (match) =>
					yearOnly
						? match.replace(yearOnly, ref(entry.key, yearOnly))
						: ref(entry.key, match.replace(/\s+/g, " ")),
				);
			}
			return part.replace(
				/McAllester \(1978, 1980\)/g,
				() => `McAllester (${ref("MCA78", "1978")}, ${ref("MCA80", "1980")})`,
			);
		})
		.join("");
	return { markdown: text + markdown.slice(at), citations };
}
