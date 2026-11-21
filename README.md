# TP Books

A pnpm monorepo of interactive books built with TP Components.

## Books

| Package | Book |
| --- | --- |
| `@tp/book-sicp` | Structure and Interpretation of Computer Programs |

## Local development

Clone this repository alongside `tp-components`. The SICP package links to the sibling TP Components checkout, just like TP Examples.

```sh
pnpm install
pnpm dev
```

Open http://127.0.0.1:4340/. The TP Components distribution must be built first; an old distribution will not provide the current interpreter simple mode.

```sh
pnpm adapt  # regenerate the section pages from the original XML Scheme/PDF branches
pnpm test   # structural and Scheme execution regression tests
pnpm build  # build the standalone site in packages/sicp/dist
```

Each book lives in `packages/NAME`, with its own source, documentation pages, adaptation scripts and tests. `pnpm dev:sicp` opens the first book. This repository is private from npm's point of view (`private: true`); it is a collection of websites, not an npm publication.

See [SICP](packages/sicp/README.md) for the adaptation status and [NOTICE](NOTICE.md) for attribution and licenses.
