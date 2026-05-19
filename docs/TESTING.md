# Testing strategy

SmartOverflow has two test layers.

## Unit tests

Unit tests target the pure algorithm and stateful engine.

Run:

```bash
npm run test:unit
```

Covered behavior:

- all items fit;
- default end-collapse;
- start-collapse;
- priority collapse;
- pinned items;
- minimum visible items;
- empty input;
- invalid input validation;
- engine subscription lifecycle.

Coverage thresholds are configured in `vitest.config.ts`:

- statements: 95%
- branches: 90%
- functions: 95%
- lines: 95%

## E2E tests

E2E tests run the real Vite demo in Chromium through Playwright.

Run:

```bash
npm run test:e2e
```

Covered behavior:

- all actions remain visible at full width;
- lower-priority actions move into More when width shrinks;
- placement updates again when width grows.

## CI

GitHub Actions runs:

```bash
npm ci
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm run test:e2e
npm run pack:check
npm audit --audit-level=high
```

## Recommended future tests

After the core stabilizes:

- browser matrix: Chromium, Firefox, WebKit;
- visual regression screenshots for demo states;
- fuzz tests for random widths/priorities;
- benchmark suite for hundreds of items;
- adapter-level tests after Vue/React wrappers are added.
