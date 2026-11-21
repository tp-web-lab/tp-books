// TP adaptation of Source Academy's Markdown exporter (Apache-2.0).
// Selects the Scheme/PDF branches; preserves block notes, all figure snippets,
// nested labels, ordered lists and mathematical annotations. See upstream.json.
// Unknown tags fail the build instead of silently dropping their content.

import { getChildrenByTagName, ancestorHasTag } from "./utilityFunctions.js";
import { getEdition } from "./editions.js";
import replaceTagWithSymbol from "./processingFunctions/replaceTagWithSymbol.js";
import recursiveProcessPureText from "./processingFunctions/recursiveProcessPureText.js";

const lang = getEdition().language;

// Optional linked edition; the canonical/PDF comparison text remains unchanged.
let linkedBibliography = false;
export const bibliographyEntries = [];
export const bibliographyCitations = [];
export function enableBibliographyLinks(value) {
  linkedBibliography = value;
  bibliographyEntries.length = 0;
  bibliographyCitations.length = 0;
}
const citationAttribute = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');


const fenceLanguage =
  "scheme";

// A couple of macros the book's LaTeX preamble/class accept aren't known to
// KaTeX (the renderer GitHub/VS Code use for $...$ / $$...$$) and break
// rendering outright rather than degrading gracefully.
const normalizeLatexMacros = text =>
  text.replace(/\\mbox\b/g, "\\text").replace(/\\mhyphen(\{\})?/g, "-");

// Adjacent XML tags that render as nothing (e.g. several <INDEX> entries in a
// row) each still have a whitespace-only text node between them, and each
// one independently collapses to a single space. Stacked together those can
// add up to 4+ literal spaces at the start of a line, which CommonMark reads
// as an indented code block. This can only be cleaned up after the whole
// document is assembled (per-node collapsing can't see the neighbors), and
// must skip actual fenced code, whose internal spacing is meaningful.
export const finalizeMarkdown = text => {
  return text
    .split(/(```[\s\S]*?```)/g)
    .map((segment, i) => {
      if (i % 2 === 1) return segment; // inside a ``` fence: leave untouched
      return segment
        .split("\n")
        .map(line => {
          const match = line.match(/^([ \t]*)([\s\S]*)$/);
          const leading = match[1];
          const rest = match[2];
          const collapsedRest = rest.replace(/[ \t]{2,}/g, " ").trimEnd();
          // A line that's actually a (possibly nested) list item or
          // blockquote carries meaningful leading indentation (see
          // processListMarkdown); anything else with leading whitespace is
          // stray (see the comment above) and should be dropped rather than
          // risk CommonMark reading 4+ spaces as an indented code block.
          const isListOrBlockquote = /^([-*+>]|[a-z0-9]+[.)])(\s|$)/.test(rest);
          return (isListOrBlockquote ? leading : "") + collapsedRest;
        })
        .join("\n");
    })
    .join("")
    .replace(/\n{3,}/g, "\n\n");
};

// name -> resolved number string (e.g. "chap:fun" -> "1", "sec:elements-of-programming" -> "1.1")
export const labelMap = new Map();
export const footnotes=[];
export function takeFootnotes(){return footnotes.splice(0).join("\n\n");}

let chapterNum = 0;
let sectionNum = 0;
let subsectionNum = 0;
let subsubsectionNum = 0;
let footnoteNum = 0;
let exerciseNum = 0;
let figureNum = 0;
let tableNum = 0;

export const resetMarkdownCounters = () => {
  footnotes.length=0;
  chapterNum = 0;
  sectionNum = 0;
  subsectionNum = 0;
  subsubsectionNum = 0;
  footnoteNum = 0;
  exerciseNum = 0;
  figureNum = 0;
  tableNum = 0;
};

const recordLabel = (node, value) => {
  function visit(parent){
    for(let child=parent.firstChild;child;child=child.nextSibling){
      if(child.nodeName==='LABEL')labelMap.set(child.getAttribute('NAME'),value);
      else if(!['JAVASCRIPT','WEB_ONLY','SOLUTION','INDEX','CHAPTER','SECTION','SUBSECTION','SUBSUBSECTION','EXERCISE','FIGURE','FOOTNOTE','TABLE'].includes(child.nodeName))visit(child);
    }
  }
  visit(node);
};

// Typesetting instructions, companion-language material and editorial metadata.
const tagsToRemove = new Set([
  "#comment",
  "COMMENT",
  "EDIT",
  "FRAGILE",
  "EXCLUDE",
  "HISTORY",
  "NAME", // consumed explicitly wherever a title is needed
  "ORDER",
  "PRIMITIVE",
  "OPERATOR",
  "FUNCTION",
  "PARSING",
  "SUBINDEX",
  "SEE",
  "SEEALSO",
  "OPEN",
  "CLOSE",
  "JAVASCRIPT",
  "WEB_ONLY",
  "SOLUTION", // consumed explicitly by EXERCISE, ignored otherwise
  "LABEL", // consumed explicitly wherever a number needs to be recorded
  "WATCH",
  "KEEP_TOGETHER",
  "START_KEEP_TOGETHER",
  "STOP_KEEP_TOGETHER",
  "SHRINK_PARAGRAPH",
  "STRETCH_PARAGRAPH",
  "DONT_BREAK_PAGE",
  "DO_BREAK_PAGE",
  "FORCE_PAGE_BREAK_AND_FILL",
  "FILBREAK",
  "LONG_PAGE",
  "SHORT_PAGE",
  "SOFT_HYP",
  "PAGEREF",
  "EXERCISE_FOLLOWED_BY_TEXT",
  "SECTIONCONTENT",
  "CHAPTERCONTENT",
  "PARSING"
]);

// Wrapper tags whose content passes straight through with no markup of its own.
const ignoreTags = new Set([lang.blockTag, "span", "SPLIT", "PDF_ONLY"]);

const title = node => {
  const nameArr = [];
  const nameNode = getChildrenByTagName(node, "NAME")[0];
  if (nameNode) {
    recursiveProcessTextMarkdown(nameNode.firstChild, nameArr);
  }
  return nameArr.join("").replace(/\s+/g, " ").trim();
};

const heading = (level, text) => {
  return "\n\n" + "#".repeat(level) + " " + text + "\n\n";
};

// Extracts code-block text. Like recursiveProcessPureText, this preserves
// whitespace/newlines verbatim (code formatting is significant, unlike
// prose), but unlike recursiveProcessPureText it doesn't silently drop
// element children it doesn't special-case (that function only visits
// #text nodes, so e.g. a <META> metavariable placeholder disappears
// entirely instead of just losing its markup). SCHEME is dropped since it's
// the other edition's code, and SPLIT/SPLITINLINE are transparent wrappers.
const codeTextHandlers = {
  INDEX: () => {}, // Index metadata is not Scheme source.
  META: (node, writeTo) => {
    writeTo.push(
      "*" + (node.firstChild ? node.firstChild.nodeValue : "") + "*"
    );
  },
  SPLIT: (node, writeTo) => recursiveProcessCodeText(node.firstChild, writeTo),
  SPLITINLINE: (node, writeTo) =>
    recursiveProcessCodeText(node.firstChild, writeTo),
  JAVASCRIPT: () => {},
  "#comment": () => {}
};

const recursiveProcessCodeText = (node, writeTo) => {
  if (!node) return;
  const name = node.nodeName;
  if (codeTextHandlers[name]) {
    codeTextHandlers[name](node, writeTo);
  } else if (name === "#text") {
    if(/^(?:\\)+addtocontents\b/.test(node.nodeValue.trim()))return;
    const raw = node.nodeValue.includes("$") ? node.nodeValue : node.nodeValue.replace(/\\textit\{([^{}]*)\}/g, "$1");
    if (!raw.match(/&(\w|\.)+;/)) {
      // "$\texttt{...}\texttt{...}$"-style runs (one or more \texttt{}
      // groups sharing a single pair of $...$) show up in code listings for
      // two different reasons: as a documented whitespace-preservation hack
      // (\texttt{ }, empty/blank content — see e.g.
      // chapter5/section5/subsection5.xml) and as inline code-styling of an
      // identifier in a comment (\texttt{val}, \texttt{factorial}). Neither
      // is real math, so unwrap both the same way: concatenate each
      // \texttt{} group's literal content (whitespace becomes literal
      // spaces; an identifier becomes plain text). This also means such
      // runs no longer look like "real $...$ math" to the code/plain-text
      // decision in processSnippetMarkdown's LATEX="yes" branch.
      writeTo.push(
        raw.replace(/\$((?:\\texttt\{[^{}]*\})+)\$/g, (_, group) => {
          const parts = [];
          const re = /\\texttt\{([^{}]*)\}/g;
          let m;
          while ((m = re.exec(group))) parts.push(m[1]);
          return parts.join("");
        })
      );
    }
  } else if (!replaceTagWithSymbol(node, writeTo)) {
    // Unrecognised wrapper: recurse rather than silently dropping its text.
    recursiveProcessCodeText(node.firstChild, writeTo);
  }
  return recursiveProcessCodeText(node.nextSibling, writeTo);
};

const fence = (node, writeTo, langTag) => {
  if (!node) return;
  const codeArr = [];
  recursiveProcessCodeText(node.firstChild, codeArr);
  const code = codeArr.join("").trim();
  if (!code) return;
  writeTo.push("\n\n```" + langTag + "\n" + code + "\n```\n\n");
};

const processSnippetMarkdown = (node, writeTo) => {
  if (node.getAttribute("HIDE") === "yes") return;
  const promptNode = node.getElementsByTagName(lang.promptTag)[0];
  const codeNode = node.getElementsByTagName(lang.blockTag)[0];
  const runNode = node.getElementsByTagName(lang.runTag)[0];
  const outputNode = node.getElementsByTagName(lang.outputTag)[0];

  if (node.getAttribute("LATEX") === "yes") {
    // LATEX="yes" (the same marker processSnippetPdf.js uses to switch out
    // of its verbatim-listing environment) covers two different cases here:
    // short syntax-pattern displays with genuine embedded math (e.g.
    // subscripted "e_1 if p_1 else ... e_n" — a fenced block would suppress
    // Markdown/math rendering of that $...$, so it needs plain text), and
    // large code/compiler-output listings that only carry LATEX="yes"
    // because of the $\texttt{ }$ whitespace hack above — those are real
    // code and should still be fenced normally. Tell them apart by checking
    // whether any $...$ math survives once the whitespace hack (already
    // stripped to literal spaces by recursiveProcessCodeText) is accounted
    // for.
    const target = codeNode || runNode;
    if (target) {
      const arr = [];
      recursiveProcessCodeText(target.firstChild, arr);
      const text = arr.join("");
      if (/\$[^$]+\$/.test(text) || /\\\[[\s\S]*?\\\]/.test(text)) {
        const plain = text.replace(/\s+/g, " ").trim();
        if (plain) writeTo.push("\n\n" + plain + "\n\n");
      } else {
        const code = text.trim();
        if (code)
          writeTo.push("\n\n```" + fenceLanguage + "\n" + code + "\n```\n\n");
      }
    }
    return;
  }

  fence(promptNode, writeTo, fenceLanguage);
  fence(codeNode || runNode, writeTo, fenceLanguage);
  fence(outputNode, writeTo, "text");
};

const processExerciseMarkdown = (node, writeTo) => {
  exerciseNum += 1;
  const number = chapterNum + "." + exerciseNum;
  recordLabel(node, number);
  writeTo.push("\n\n**Exercise " + number + ".** ");
  // SOLUTION is a child of EXERCISE; recursing into firstChild's siblings
  // would include it, so walk siblings and skip SOLUTION explicitly.
  for (let child = node.firstChild; child; child = child.nextSibling) {
    if (child.nodeName === "SOLUTION") continue;
    processTextMarkdown(child, writeTo);
  }
  writeTo.push("\n\n");
};

// Image assets are served from the public site rather than a local relative
// path, so the .md file renders correctly wherever it's read/shared, not
// just from its own location in this repo checkout. The FIGURE/IMAGE src
// attribute already includes the img_original/img_javascript subfolder, e.g.
// src="img_original/2.9.svg" -> https://sicp.sourceacademy.org/img_original/2.9.svg.
// No format conversion is needed (unlike the PDF pipeline's
// gif->png/svg->svg.pdf juggling for LaTeX compatibility) since SVG/PNG both
// render natively in GFM/VS Code.
const imageBaseUrl = "https://sicp.sourceacademy.org/";
const imageMarkdown = src =>
  src ? "\n\n![](" + imageBaseUrl + src + ")\n\n" : "";

const processFigureMarkdown = (node, writeTo) => {
  figureNum += 1;
  const number = chapterNum + "." + figureNum;
  recordLabel(node, number);

  // src can live directly on this FIGURE, on a nested caption-less
  // <FIGURE src="..."> (the Python edition's usual shape: an outer FIGURE
  // carries LABEL/CAPTION, an inner one carries src — mirrors the fallback
  // in processFigurePdf.js), or on one or more <IMAGE src="..."> children.
  const src=node.getAttribute("src");
  const images=src?[src]:[...Array.from(node.getElementsByTagName("FIGURE")),...Array.from(node.getElementsByTagName("IMAGE"))].map(n=>n.getAttribute("src")).filter(Boolean);
  for(const image of images)writeTo.push(imageMarkdown(image));
  for(const child of Array.from(node.childNodes)){
    if(child.nodeName==='SNIPPET')processSnippetMarkdown(child,writeTo);
    if(child.nodeName==='TABLE')processTableMarkdown(child,writeTo);
    if(child.nodeName==='PDF_ONLY')recursiveProcessTextMarkdown(child.firstChild,writeTo);
  }

  const captionArr = [];
  const caption = node.getElementsByTagName("CAPTION")[0];
  if (caption) {
    recursiveProcessTextMarkdown(caption.firstChild, captionArr);
  }
  writeTo.push(
    "\n\n**Figure " + number + ".** " + captionArr.join("").trim() + "\n\n"
  );

  if((node.getAttribute("CONTINUED")??"").toLowerCase()==="yes")figureNum--;
};

const processTableMarkdown = (node, writeTo) => {
  const rows = getChildrenByTagName(node, "TR");
  if (rows.length === 0) {
    recursiveProcessTextMarkdown(node.firstChild, writeTo);
    return;
  }
  writeTo.push("\n\n");
  rows.forEach((row, rowIndex) => {
    const cells = getChildrenByTagName(row, "TD");
    const cellStrs = cells.map(cell => {
      const arr = [];
      recursiveProcessTextMarkdown(cell.firstChild, arr);
      return arr
        .join("")
        .replace(/\s+/g, " ")
        .replace(/\|/g, "\\|")
        .trim();
    });
    writeTo.push("| " + cellStrs.join(" | ") + " |\n");
    if (rowIndex === 0) {
      writeTo.push("|" + cellStrs.map(() => " --- ").join("|") + "|\n");
    }
  });
  writeTo.push("\n\n");
};

const listDepth = node => {
  let depth = 0;
  for (let p = node.parentNode; p; p = p.parentNode) {
    if (p.nodeName === "OL" || p.nodeName === "UL") depth += 1;
  }
  return depth;
};

const processListMarkdown = (node, writeTo, marker) => {
  // node is the OL/UL's firstChild (an LI or whitespace), so depth is read
  // off its parent — the list element itself — not off node directly.
  const indent = "  ".repeat(Math.max(0, listDepth(node.parentNode) - 1));
  let index = 0;
  for (let li = node; li; li = li.nextSibling) {
    if (li.nodeName !== "LI") continue;
    const bullet = marker === "alpha" ? String.fromCharCode(97 + index) + "." : marker === "num" ? `${index+1}.` : "-";
    writeTo.push("\n" + indent + bullet + " ");
    recursiveProcessTextMarkdown(li.firstChild, writeTo);
    index += 1;
  }
  writeTo.push("\n");
};

const numberedHeading = (node, writeTo, level, number) => {
  recordLabel(node, number);
  writeTo.push(heading(level, number + " " + title(node)));
};

const unnumberedHeading = (node, writeTo, level) => {
  writeTo.push(heading(level, title(node)));
};

const processTextFunctionsMarkdown = {
  "#text": (node, writeTo) => {
    if(/^(?:\\)+addtocontents\b/.test(node.nodeValue.trim()))return;
    const raw = node.nodeValue;
    if (raw.match(/&(\w|\.)+;/)) {
      // Include-entity placeholder (e.g. &section1.1;), meaningful only to
      // the LaTeX \input pipeline (see processFileInput.js). This pipeline
      // already includes that content by walking files in document order,
      // so the placeholder itself contributes nothing here.
      return;
    }
    if (
      !ancestorHasTag(node, "SNIPPET") &&
      /^(\s|\\[a-zA-Z]+|\{[^{}]*\}|\[[^[\]]*\])+$/.test(raw)
    ) {
      // Bare LaTeX control text with no prose content — commands with
      // optional {...}/[...] arguments, e.g. "\par\medskip" or
      // "\begin{itemize}[label={},leftmargin=0pt,itemsep=1ex]\small" (both
      // found as free text inside <PDF_ONLY>) — are pure PDF layout setup.
      // Markdown gets paragraph spacing from blank lines and list markup
      // from "-"/"1.", so drop these rather than leaking raw LaTeX.
      return;
    }
    const value = raw.replace(/[\r\n]+/, " ").replace(/\s+/g, " ");
    writeTo.push(value);
  },

  INDEX: () => {
    // Index-only bookkeeping: its text content duplicates nearby running
    // prose (see xml_py source convention) and must not be rendered.
  },

  SPLITINLINE: (node, writeTo) => {
    recursiveProcessTextMarkdown(node.firstChild, writeTo);
  },

  CHAPTER: (node, writeTo) => {
    chapterNum += 1;
    sectionNum = 0;
    subsectionNum = 0;
    subsubsectionNum = 0;
    footnoteNum = 0;
    exerciseNum = 0;
    figureNum = 0;
    tableNum = 0;
    numberedHeading(node, writeTo, 1, String(chapterNum));
    recursiveProcessTextMarkdown(node.firstChild, writeTo);
  },

  ABOUT: (node, writeTo) => {
    unnumberedHeading(node, writeTo, 1);
    recordLabel(node, title(node));
    recursiveProcessTextMarkdown(node.firstChild, writeTo);
  },
  REFERENCES: (node, writeTo) =>
    processTextFunctionsMarkdown["ABOUT"](node, writeTo),
  WEBPREFACE: (node, writeTo) =>
    processTextFunctionsMarkdown["ABOUT"](node, writeTo),
  MATTER: (node, writeTo) =>
    processTextFunctionsMarkdown["ABOUT"](node, writeTo),

  MATTERSECTION: (node, writeTo) => {
    unnumberedHeading(node, writeTo, 2);
    recursiveProcessTextMarkdown(node.firstChild, writeTo);
  },

  SECTION: (node, writeTo) => {
    if (ancestorHasTag(node, "MATTER")) {
      unnumberedHeading(node, writeTo, 2);
    } else {
      sectionNum += 1;
      subsectionNum = 0;
      subsubsectionNum = 0;
      numberedHeading(node, writeTo, 2, chapterNum + "." + sectionNum);
    }
    recursiveProcessTextMarkdown(node.firstChild, writeTo);
  },

  SUBSECTION: (node, writeTo) => {
    if (ancestorHasTag(node, "MATTER")) {
      unnumberedHeading(node, writeTo, 3);
    } else {
      subsectionNum += 1;
      subsubsectionNum = 0;
      numberedHeading(
        node,
        writeTo,
        3,
        chapterNum + "." + sectionNum + "." + subsectionNum
      );
    }
    recursiveProcessTextMarkdown(node.firstChild, writeTo);
  },

  SUBSUBSECTION: (node, writeTo) => {
    if (ancestorHasTag(node, "MATTER")) {
      unnumberedHeading(node, writeTo, 4);
    } else {
      subsubsectionNum += 1;
      numberedHeading(
        node,
        writeTo,
        4,
        chapterNum +
          "." +
          sectionNum +
          "." +
          subsectionNum +
          "." +
          subsubsectionNum
      );
    }
    recursiveProcessTextMarkdown(node.firstChild, writeTo);
  },

  SUBHEADING: (node, writeTo) => {
    unnumberedHeading(node, writeTo, 4);
    recursiveProcessTextMarkdown(node.firstChild, writeTo);
  },

  SUBSUBHEADING: (node, writeTo) => {
    writeTo.push("\n\n**" + title(node) + "**\n\n");
    recursiveProcessTextMarkdown(node.firstChild, writeTo);
  },

  P: (node, writeTo) => processTextFunctionsMarkdown["TEXT"](node, writeTo),
  PDF_ONLY: (node, writeTo) => {
    if (/^\s*\\\\(?:\[[^\]]*\])?\s*$/.test(node.textContent)) {
      writeTo.push("\n\n");
      return;
    }
    recursiveProcessTextMarkdown(node.firstChild, writeTo);
  },

  TEXT: (node, writeTo) => {
    writeTo.push("\n\n");
    recursiveProcessTextMarkdown(node.firstChild, writeTo);
    writeTo.push("\n\n");
  },

  EXERCISE: (node, writeTo) => processExerciseMarkdown(node, writeTo),

  FOOTNOTE: (node, writeTo) => {
    footnoteNum += 1;
    const id = `${chapterNum}-${footnoteNum}`;
    recordLabel(node,String(footnoteNum));
    const content=[];
    recursiveProcessTextMarkdown(node.firstChild,content);
    writeTo.push(`[^${id}]`);
    footnotes.push(`[^${id}]: `+content.join("").trim().split("\n").join("\n    "));
  },

  FIGURE: (node, writeTo) => processFigureMarkdown(node, writeTo),
  IMAGE: () => {},

  TABLE: (node, writeTo) => processTableMarkdown(node, writeTo),

  SNIPPET: (node, writeTo) => processSnippetMarkdown(node, writeTo),

  OL: (node, writeTo) =>
    processListMarkdown(
      node.firstChild,
      writeTo,
      ancestorHasTag(node, "EXERCISE") ? "alpha" : "num"
    ),
  UL: (node, writeTo) =>
    processListMarkdown(node.firstChild, writeTo, "bullet"),

  B: (node, writeTo) => {
    writeTo.push("**");
    recursiveProcessTextMarkdown(node.firstChild, writeTo);
    writeTo.push("**");
  },

  EM: (node, writeTo) => processTextFunctionsMarkdown["em"](node, writeTo),
  em: (node, writeTo) => {
    writeTo.push("*");
    recursiveProcessTextMarkdown(node.firstChild, writeTo);
    writeTo.push("*");
  },

  SC: (node, writeTo) => {
    recursiveProcessTextMarkdown(node.firstChild, writeTo);
  },

  TT: (node, writeTo) => {
    writeTo.push("`");
    recursiveProcessTextMarkdown(node.firstChild, writeTo);
    writeTo.push("`");
  },

  BR: (node, writeTo) => {
    writeTo.push("  \n");
  },

  QUOTE: (node, writeTo) => {
    writeTo.push('"');
    recursiveProcessTextMarkdown(node.firstChild, writeTo);
    writeTo.push('"');
  },

  BLOCKQUOTE: (node, writeTo) => {
    const contentArr = [];
    recursiveProcessTextMarkdown(node.firstChild, contentArr);
    const quoted = contentArr
      .join("")
      .trim()
      .split("\n")
      .map(line => "> " + line)
      .join("\n");
    writeTo.push("\n\n" + quoted + "\n\n");
  },

  NOINDENT: () => {},

  EPIGRAPH: (node, writeTo) => {
    const contentArr = [];
    for (let child = node.firstChild; child; child = child.nextSibling) {
      if (child.nodeName === "ATTRIBUTION" || child.nodeName === "SIGNATURE")
        continue;
      processTextMarkdown(child, contentArr);
    }
    const quoted = contentArr
      .join("")
      .trim()
      .split("\n")
      .map(line => "> " + line)
      .join("\n");
    writeTo.push("\n\n" + quoted);
    const signature = getChildrenByTagName(node, "SIGNATURE")[0];
    const attribution =
      getChildrenByTagName(node, "ATTRIBUTION")[0] ||
      (signature && getChildrenByTagName(signature, "ATTRIBUTION")[0]);
    if (attribution) {
      writeTo.push("\n> — ");
      processTextFunctionsMarkdown["ATTRIBUTION"](attribution, writeTo);
    }
    writeTo.push("\n\n");
  },

  // A closing signature outside an EPIGRAPH (e.g. at the end of a foreword),
  // wrapping a single ATTRIBUTION.
  SIGNATURE: (node, writeTo) => {
    const attribution = getChildrenByTagName(node, "ATTRIBUTION")[0];
    if (!attribution) return;
    writeTo.push("\n\n— ");
    processTextFunctionsMarkdown["ATTRIBUTION"](attribution, writeTo);
    writeTo.push("\n\n");
  },

  ATTRIBUTION: (node, writeTo) => {
    const parts = [];
    for (const tag of ["AUTHOR", "TITLE", "DATE"]) {
      const child = getChildrenByTagName(node, tag)[0];
      if (!child) continue;
      const arr = [];
      recursiveProcessTextMarkdown(child.firstChild, arr);
      const text = arr.join("").trim();
      if (text) parts.push(text);
    }
    if (parts.length > 0) {
      writeTo.push(parts.join(", "));
    } else {
      recursiveProcessTextMarkdown(node.firstChild, writeTo);
    }
  },

  // Bibliography entries and citations retain their original words.
  REFERENCE: (node, writeTo) => {
    const body=[];
    recursiveProcessTextMarkdown(node.firstChild, body);
    if (linkedBibliography) {
      const content=finalizeMarkdown(body.join('')).trim();
      const key=node.getAttribute('NAME') || `SICP-BIB-${bibliographyEntries.length+1}`;
      const year=content.match(/\b(?:18|19|20)\d{2}[a-z]?\b/)?.[0] ?? '';
      const author=content.split(',')[0].split('. ')[0].replaceAll('*','');
      bibliographyEntries.push({key,content,label:year&&!author.includes(year)?`${author} ${year}`:author});
    }
    writeTo.push("\n\n- ", ...body);
  },

  CITATION: (node, writeTo) => {
    const text = node.getElementsByTagName("TEXT")[0];
    const body=[];
    recursiveProcessTextMarkdown((text || node).firstChild, body);
    const label=body.join('').replace(/\s+/g,' ').trim();
    const key=node.getAttribute('NAME');
    if(linkedBibliography && key){
      bibliographyCitations.push({key,label});
      writeTo.push(`:tp-ref:{href="@${citationAttribute(key)}" label="${citationAttribute(label)}"}`);
    } else writeTo.push(...body);
  },

  LINK: (node, writeTo) => {
    recursiveProcessTextMarkdown(node.firstChild, writeTo);
  },

  // Raw LaTeX math. The source already wraps genuine math in $...$ (GFM/
  // KaTeX's own inline-math delimiter), so that case needs no translation at
  // all. LATEX (as opposed to LATEXINLINE) is occasionally used for display
  // math instead, delimited LaTeX-style as \[ ... \]; GFM's equivalent is
  // $$ ... $$. The remaining handful of LATEXINLINE uses have no LaTeX in
  // them at all — just a bare metavariable name (e.g. "consequent") meant to
  // be italicized, the same convention $\langle\textit{name}\rangle$ uses
  // elsewhere; italicize those too rather than leaving them as plain text.
  //
  // A few macros the book's own LaTeX preamble/class define or accept aren't
  // known to KaTeX and break rendering outright: \mbox (KaTeX wants \text)
  // and \mhyphen (a custom non-breaking-hyphen macro from mit.cls, with no
  // KaTeX meaning at all — just becomes a literal hyphen).
  LATEX: (node, writeTo) => {
    const arr = [];
    recursiveProcessPureText(node.firstChild, arr);
    const text = normalizeLatexMacros(arr.join("").trim());
    const display = text.match(/^\\\[([\s\S]*)\\\]$/);
    if (display) {
      writeTo.push("\n\n$$" + display[1].trim() + "$$\n\n");
    } else if (
      /\\begin\{(tabular|flushleft|flushright|center|minipage)\}/.test(text)
    ) {
      // A page-layout construct (e.g. a table of code tokens with arrows
      // pointing to explanatory labels underneath), not math — no Markdown
      // equivalent exists, and leaking the raw LaTeX is worse than dropping
      // it, since the same content is already conveyed by the code snippet
      // and surrounding prose.
      writeTo.push("\n\n::: tp-latex\n:::: script {type=\"tp/latex\"}\n"+text.replace(/\\normalcodesize/g,"").replace(/@\{~\}/g, "@{}").replace(/\\\\\[[^\]]+\]/g, "\\\\").replace(/\\rule\{0pt\}\{[^}]+\}/g, "")+"\n::::\n:::\n\n");
      return;
    } else if (text.startsWith("$")) {
      // Already its own $...$ inline math, just sitting in a block-level
      // LATEX tag instead of LATEXINLINE — pass through as-is rather than
      // double-wrapping into "$$$...$$$".
      writeTo.push(text);
    } else {
      // Math with no delimiters at all; GFM/KaTeX needs $$...$$ to render it
      // as display math rather than showing the raw LaTeX source.
      writeTo.push("\n\n$$" + text + "$$\n\n");
    }
  },
  LATEXINLINE: (node, writeTo) => {
    const arr = [];
    recursiveProcessPureText(node.firstChild, arr);
    const text = normalizeLatexMacros(arr.join("").trim());
    if (text.startsWith("$")) {
      writeTo.push(text);
    } else if (text.startsWith("\\")) {
      // A bare LaTeX command with no $...$ delimiters (e.g. "\ldots" on its
      // own); needs $...$ to render as math rather than showing as literal
      // backslash-text.
      writeTo.push("$" + text + "$");
    } else {
      writeTo.push("*" + text + "*");
    }
  },
  DOLLAR: (_node, writeTo) => writeTo.push("\\$"),

  LaTeX: (node, writeTo) => {
    writeTo.push("LaTeX");
  },
  TeX: (node, writeTo) => {
    writeTo.push("TeX");
  },

  META: (node, writeTo) => {
    writeTo.push(
      "*" + (node.firstChild ? node.firstChild.nodeValue : "") + "*"
    );
  },
  METAPHRASE: (node, writeTo) => {
    writeTo.push("&lt;");
    recursiveProcessTextMarkdown(node.firstChild, writeTo);
    writeTo.push("&gt;");
  },

  REF: (node, writeTo) => {
    const name = node.getAttribute("NAME");
    writeTo.push(labelMap.get(name) || "??");
  },

  DECLARATION: (node, writeTo) =>
    processTextFunctionsMarkdown[lang.inlineTag](node, writeTo),
  USE: (node, writeTo) =>
    processTextFunctionsMarkdown[lang.inlineTag](node, writeTo),
  EM_NO_INDEX: (node, writeTo) => processTextFunctionsMarkdown.EM(node,writeTo),
  JAVASCRIPTINLINE: (node, writeTo) => processTextFunctionsMarkdown[lang.inlineTag](node,writeTo),
  SCHEMEINLINE: (node, writeTo) =>
    processTextFunctionsMarkdown[lang.inlineTag](node, writeTo),
  ECMA: () => {},
  PLR: () => {},
  [lang.inlineTag]: (node, writeTo) => {
    // Inline code can contain mathematical metavariables. The old pure-text
    // visitor discarded element children, turning e.g. (transpose m) into
    // (transpose ). Preserve those children outside the code span.
    let code = "";
    const flush = () => {
      if (!code) return;
      writeTo.push("`" + code.replace(/\s+/g, " ").replace(/_@/g, "_").replace(/@/g, "") + "`");
      code = "";
    };
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeName === "#text") code += child.nodeValue;
      else if (["LATEXINLINE", "META", "METAPHRASE"].includes(child.nodeName)) {
        flush();
        processTextMarkdown(child, writeTo);
      } else {
        const parts = [];
        if (replaceTagWithSymbol(child, parts)) code += parts.join("");
        else code += child.textContent;
      }
    }
    flush();
  }
};

const processTextMarkdown = (node, writeTo) => {
  const name = node.nodeName;
  if (processTextFunctionsMarkdown[name]) {
    processTextFunctionsMarkdown[name](node, writeTo);
    return true;
  }
  if (replaceTagWithSymbol(node, writeTo) || tagsToRemove.has(name)) {
    return true;
  }
  if (ignoreTags.has(name)) {
    recursiveProcessTextMarkdown(node.firstChild, writeTo);
    return true;
  }
  throw new Error("Unrecognised XML tag: " + node.nodeName);
  return false;
};

export const recursiveProcessTextMarkdown = (node, writeTo) => {
  if (!node) return;
  processTextMarkdown(node, writeTo);
  return recursiveProcessTextMarkdown(node.nextSibling, writeTo);
};

export function extractCode(node){const output=[];if(node)recursiveProcessCodeText(node.firstChild,output);return output.join("").trim();}
