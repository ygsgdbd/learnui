# Domain Docs

This repository uses a multi-context domain-documentation layout.

## Before exploring

Read:

- `CONTEXT-MAP.md` to locate the relevant context.
- `packages/web/CONTEXT.md` for the Web component library.
- `packages/native/CONTEXT.md` for the React Native component library.
- Relevant system-wide decisions under `docs/adr/`.
- Relevant package-specific decisions under `packages/<context>/docs/adr/`.

Missing domain files are created lazily when terminology or architectural decisions are resolved.

## Vocabulary

Use terminology defined in the relevant `CONTEXT.md`. Do not silently replace established terms with synonyms.

## ADR conflicts

If proposed work contradicts an existing ADR, identify that conflict explicitly instead of silently overriding it.

Accepted ADRs and closed Issue resolution comments are authoritative product decisions. Research documents preserve evidence and candidate recommendations; when they conflict with an accepted decision, follow the accepted decision and treat the research wording as historical context.
