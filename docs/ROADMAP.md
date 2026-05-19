# Roadmap

## v0.1 — Core product foundation

Goal: publish a credible production-ready core package.

- [x] Pure TypeScript overflow calculation
- [x] Stable public types
- [x] Stateful engine wrapper
- [x] Vanilla demo
- [x] Unit tests
- [x] E2E tests
- [x] CI workflow
- [x] npm release workflow
- [x] Security policy
- [x] Publishing documentation

## v0.2 — DOM measurement helpers

Goal: make browser integration easier without becoming a UI component.

Potential APIs:

```ts
measureOverflowItems(container, options)
createOverflowObserver(container, callback, options)
```

Rules:

- no framework dependency;
- no styling opinions;
- helpers must be optional and tree-shakeable.

## v0.3 — Accessibility recipes

Goal: document safe rendering patterns for common widgets.

- toolbar + menu pattern;
- tabs + overflow list pattern;
- breadcrumbs + collapsed ancestors pattern;
- keyboard navigation recipes.

## v0.4 — Framework adapters

Goal: add thin wrappers only after the core API is stable.

Candidates:

- `@smart-overflow/vue`
- `@smart-overflow/react`

Expected adapter size: 50–100 lines each, mostly measurement and lifecycle glue.

## v1.0 — Stable API

Requirements before v1:

- real project usage feedback;
- no known algorithm correctness issues;
- documented migration policy;
- stable package exports;
- benchmark results for large lists;
- adapter API finalized or explicitly separated from core.
