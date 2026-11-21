# Structure and Interpretation of Computer Programs

Harold Abelson and Gerald Jay Sussman, with Julie Sussman.

## The original Scheme text

This interactive edition follows the **Scheme Edition PDF supplied for this project**. Its 33 reading pages cover the foreword, prefaces, acknowledgments, five chapters and references, split at level-one and level-two headings. Deeper headings remain within their section.

The initially supplied Markdown was incomplete: its exporter discarded Scheme-specific prose and programs. It is retained unchanged for provenance, but is **not the text used by this edition**. The reading text is regenerated from the original XML sources, retaining Scheme and PDF-only content, the original exercises, notes, formulas and figures. The upstream revision is recorded in source/upstream.json. Each section links to its corresponding PDF page. Unresolved references printed as “??” in the PDF are retained as such; they are not silently rewritten.

[Open the complete original PDF](original/sicp.pdf), including the title pages and the original printed index. [Open the original index](original/sicp.pdf#page=583).

## Interactive additions

Examples with printed results use **tp-scheme in simple mode**, powered by LIPS. Press **Return** in the query field to execute; **Shift+Return** is equivalent. Edited source is reloaded before the query and displays **> Program reloaded.**. Consecutive queries share one interpreter. Dependencies are included in the editable source so that a section can be opened directly. Nothing runs automatically.

The book’s printed result is retained beneath each example. The editable program may include support definitions or a run-example procedure to execute several queries in order; these are TP presentation adaptations, not changes to the authors’ prose. Some interactive exercises include editable TP reference implementations, clearly identified next to the cell. Advanced transcripts include their evaluator or register-machine support; the [execution audit](audit.md) records results, numerical equivalences, intentional errors, adaptations and any unresolved cases. Text fidelity and execution compatibility are separate checks. See the [text conformity audit](text-conformity.md) for the comparison of all reading sections and the documented corrections to defects in the PDF.

## Attribution

The original text is by Harold Abelson and Gerald Jay Sussman, with Julie Sussman. The source archive is maintained by Source Academy. Figures credit Andres Raba, Martin Henz and Tobias Wrigstad. The supplied PDF’s copyright page (page 4) specifies CC BY-NC-SA 4.0 for the publication, CC BY-SA 4.0 for the underlying text and figures, and GPLv3 for Scheme programs. Those notices apply to the retained material; TP adaptations are identified separately. See NOTICE.md in the repository for links and attribution.
