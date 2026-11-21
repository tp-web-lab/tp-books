# TP Books

- Each book is a package in packages/. Preserve supplied sources under source/ unchanged.
- Generate book pages reproducibly; document corrections with their source and location.
- Prefer native markup, and use TP components for interactive controls. All TP components render in light DOM.
- Never treat expected printed output as executable input. Verify actual interpreter results independently.
- Distinguish incomplete exercises, intentional errors, engine limitations and adaptation defects in the audit.
- Do not claim complete compatibility based only on generation or build success.
- Run the book's tests and build after changes. Do not commit node_modules or dist.
