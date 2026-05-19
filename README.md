# SmartOverflow

A tiny framework-agnostic TypeScript engine for responsive toolbars, tabs, menus, breadcrumbs and action bars.

SmartOverflow is **not a UI component**. It does not render buttons, dropdowns, portals, animations or CSS. It only answers one question:

> Given item widths and container width, which items stay visible and which move into “More”?

That makes the package easy to use with Vue, React, Svelte, Solid, Web Components, vanilla TypeScript or any internal design system.

## Why this exists

Frontend products often need an action row like this:

```txt
[Edit] [Delete] [Duplicate] [Export] [Share] [Archive]
```

When the container shrinks, the least important actions should move into a stable overflow menu:

```txt
[Edit] [Delete] [More]
```

Most implementations end up as fragile component-specific logic. SmartOverflow keeps the difficult part — deterministic overflow calculation — in a small, typed, tested core.

## Features

- Framework-agnostic, headless TypeScript core
- Zero runtime dependencies
- Pure deterministic `calculateOverflow()` function
- Optional stateful `SmartOverflowEngine`
- Priority-based or order-based collapse strategies
- Pinned items that never intentionally move into overflow
- Handles overflow indicator width and CSS gaps
- Fully typed public API
- Unit test suite with high coverage thresholds
- Playwright e2e demo tests
- CI and npm release workflow prepared for trusted publishing/provenance

## Installation

```bash
npm install smart-overflow
```

Until you publish the package, install locally from the generated tarball or workspace folder:

```bash
npm install ./smart-overflow
```

## Quick start

```ts
import { calculateOverflow } from 'smart-overflow';

const result = calculateOverflow({
  containerWidth: 260,
  overflowIndicatorWidth: 64,
  gap: 8,
  strategy: 'priority',
  items: [
    { id: 'edit', width: 48, priority: 100, pinned: true },
    { id: 'delete', width: 64, priority: 80 },
    { id: 'duplicate', width: 92, priority: 40 },
    { id: 'export', width: 72, priority: 60 },
    { id: 'archive', width: 80, priority: 10 },
  ],
});

console.log(result.visibleIds); // ['edit', 'delete']
console.log(result.hiddenIds); // ['duplicate', 'export', 'archive']
```

In your UI layer, render `visibleIds` in the main row and `hiddenIds` inside your own dropdown/menu/popover.

## Core API

### `calculateOverflow(input)`

Pure function. It performs no DOM reads, no DOM writes, no observers, no timers and no network calls.

```ts
import { calculateOverflow, type CalculateOverflowInput } from 'smart-overflow';

const input: CalculateOverflowInput = {
  containerWidth: 320,
  overflowIndicatorWidth: 64,
  gap: 8,
  minVisibleItems: 1,
  strategy: 'collapse-end',
  items: [
    { id: 'overview', width: 88 },
    { id: 'settings', width: 96 },
  ],
};

const result = calculateOverflow(input);
```

### Input

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `containerWidth` | `number` | required | Available inner width of the container in CSS pixels. |
| `items` | `SmartOverflowItem[]` | required | Items in visual order. |
| `overflowIndicatorWidth` | `number` | `0` | Width of your “More” button. Counted only when at least one item is hidden. |
| `gap` | `number` | `0` | Gap between visible items and between last visible item and “More”. |
| `minVisibleItems` | `number` | `0` | Minimum number of non-pinned items to keep visible when possible. |
| `strategy` | `'collapse-end' \| 'collapse-start' \| 'priority'` | `'collapse-end'` | How the engine chooses the next hideable item. |

### Item

```ts
export type SmartOverflowItem<TMeta = unknown> = {
  id: string | number;
  width: number;
  priority?: number;
  pinned?: boolean;
  meta?: TMeta;
};
```

`priority` is used only with `strategy: 'priority'`. Higher priority means “keep this item visible longer”. Ties are collapsed from the end to match common toolbar behavior.

`pinned` means the item is never intentionally hidden. If pinned items alone cannot fit, SmartOverflow reports `isOverflowing: true` and `remainingOverflowWidth`.

### Result

```ts
export type SmartOverflowResult<TMeta = unknown> = {
  visibleItems: SmartOverflowPlacement<TMeta>[];
  hiddenItems: SmartOverflowPlacement<TMeta>[];
  visibleIds: Array<string | number>;
  hiddenIds: Array<string | number>;
  overflowIndicatorVisible: boolean;
  usedWidth: number;
  isOverflowing: boolean;
  remainingOverflowWidth: number;
  options: {
    containerWidth: number;
    overflowIndicatorWidth: number;
    gap: number;
    minVisibleItems: number;
    strategy: SmartOverflowStrategy;
  };
};
```

## Stateful engine

For apps that already own measurements but want a small observable store:

```ts
import { SmartOverflowEngine } from 'smart-overflow';

const engine = new SmartOverflowEngine({
  containerWidth: 320,
  overflowIndicatorWidth: 64,
  gap: 8,
  items,
});

const unsubscribe = engine.subscribe((result) => {
  renderToolbar(result.visibleIds, result.hiddenIds);
});

engine.patch({ containerWidth: 240 });
unsubscribe();
engine.destroy();
```

## Measuring items in a real UI

SmartOverflow expects measured widths. Keep measurement in your app/design-system layer:

```ts
const items = Array.from(toolbar.querySelectorAll('[data-action-id]')).map((element) => ({
  id: element.getAttribute('data-action-id')!,
  width: element.getBoundingClientRect().width,
}));

const result = calculateOverflow({
  containerWidth: toolbar.clientWidth,
  overflowIndicatorWidth: moreButton.getBoundingClientRect().width,
  gap: 8,
  items,
});
```

Recommended production pattern:

1. Measure after fonts and layout are ready.
2. Recalculate on `ResizeObserver` events.
3. Debounce only if your UI causes heavy re-rendering.
4. Keep the “More” button measurable even when not rendered, or cache its width.
5. Use stable `id` values and render output in original order.

## Demo

```bash
npm install
npm run demo
```

The demo is intentionally vanilla TypeScript. It proves that the core works without Vue/React adapters.

## Tests

```bash
npm run test:unit
npm run test:e2e
npm run check
```

- Unit tests validate pure algorithm behavior and engine subscriptions.
- E2E tests run the Vite demo in Chromium and verify real responsive behavior.
- Coverage thresholds are configured in `vitest.config.ts`.

## Package quality

The repository includes:

- strict TypeScript config
- ESLint flat config
- Prettier config
- GitHub Actions CI
- release workflow for npm trusted publishing/provenance
- Dependabot config
- security policy
- contributing guide
- issue templates
- changelog

## Publishing to npm

Before publishing:

1. Replace `YOUR_GITHUB_USERNAME`, `YOUR_NAME` and `YOUR_EMAIL` in `package.json` and `LICENSE`.
2. Create the GitHub repository.
3. Run locally:

```bash
npm install
npm run check
npm run test:e2e
npm run pack:check
```

4. Configure npm trusted publishing for the GitHub Actions workflow `.github/workflows/release.yml`.
5. Create a GitHub Release or run the workflow manually, depending on your preferred release policy.

See [`docs/PUBLISHING.md`](./docs/PUBLISHING.md) for the full checklist.

## Roadmap

The first product milestone is deliberately focused on **core + demo + tests**.

Planned after core stabilization:

- DOM measurement helpers
- Vue adapter
- React adapter
- accessibility recipes for menu/listbox integrations
- visual regression tests for demo examples
- benchmark suite for large toolbars/tabs

See [`docs/ROADMAP.md`](./docs/ROADMAP.md).

## License

MIT
