/** Adapt the book's LaTeX delimiters to TP Markdown's native math syntax. */
export function mathMarkup(source) {
  // Preserve the six columns and their original wording; PDF font switches
  // (\\tt, \\normalsize) are not supported by the web LaTeX renderer.
  source = source.replace(/::: tp-latex\n:::: script[^\n]*\n([\s\S]*?)\n::::\n:::/g, (block, code) => {
    if (!code.includes("\\tt\\textbf{(define}")) return block;
    return "| `(define` | `(square` | `x)` | `(*` | `x` | `x))` |\n" +
      "| :---: | :---: | :---: | :---: | :---: | :---: |\n" +
      "| ↑ | ↑ | ↑ | ↑ | ↑ | ↑ |\n" +
      "| To | square | something, | multiply | it | by itself. |";
  });
  const protectedParts = /(```[\s\S]*?```|:::: script[^\n]*\n[\s\S]*?\n::::|`[^`\n]*`)/g;
  return source.split(protectedParts).map((part, index) => {
    if (index % 2) return part;
    return part.replace(/\\\[([\s\S]*?)\\\]|(\\begin\{eqnarray\*?\}[\s\S]*?\\end\{eqnarray\*?\})|\$\$([\s\S]*?)\$\$|(?<!\\)\$((?:\\.|[^$])*?)\$/g,
      (_all, bracketed, environment, display, inline) => {
        let code = (bracketed ?? environment ?? display ?? inline).replace(/^> ?/gm, '').trim();
        if (inline !== undefined) {
          // The Greek epigraph uses a TeX font hack unsupported by MathJax.
          if (code.includes('\\def\\aal')) return 'Μεταβάλλον ἀναπαύεται';
          return ':latexmath:`' + code.replace(/\s+/g, ' ') + '`';
        }
        return '\n\n```latexmath\n' + code + '\n```\n\n';
      });
  }).join('');
}
