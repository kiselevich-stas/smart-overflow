# Architecture

SmartOverflow is intentionally small and layered.

```txt
src/
  core.ts       pure placement algorithm
  engine.ts     small observable wrapper around the pure algorithm
  guards.ts     runtime validation for public inputs
  types.ts      public TypeScript API
  index.ts      public exports

demo/
  main.ts       vanilla TypeScript browser integration
  styles.css    demo-only presentation

tests/
  unit/         algorithm and engine tests
  e2e/          Playwright tests against the demo
```

## Design principles

### 1. Headless core

The package does not ship UI components. The core has no dependency on Vue, React, the DOM, CSS, popper libraries or animation systems.

Consumers provide measured item widths and render the result however they want.

### 2. Deterministic algorithm

`calculateOverflow()` is a pure function:

- same input → same output
- no mutation of user input
- no timers
- no observers
- no DOM access
- no side effects

This makes the core easy to test, reason about and use on the server if needed.

### 3. Stable output order

The engine may hide items according to end/start/priority strategy, but `visibleItems` and `hiddenItems` are always returned in original visual order.

This avoids surprising dropdown ordering.

### 4. Explicit overflow indicator width

The “More” button itself consumes space. SmartOverflow counts `overflowIndicatorWidth` only when at least one item is hidden.

This prevents the common bug where the first hidden item causes the row to overflow because the More button was not included in the calculation.

### 5. Pinned item escape hatch

Some actions should remain visible, for example primary save/submit actions. Pinned items are never intentionally hidden. If they cannot fit, the result reports `isOverflowing` instead of hiding them unexpectedly.

## Algorithm summary

1. Validate input.
2. Normalize defaults.
3. Mark every item as visible.
4. Build a hide order from the selected strategy.
5. While used width is greater than container width:
   - pick the next hideable item;
   - respect `pinned` and `minVisibleItems`;
   - hide the item;
   - recalculate used width including the overflow indicator.
6. Return placements and diagnostic metadata.

## Why no adapters in v0.1

Adapters should be thin layers over stable primitives. Starting with Vue/React wrappers too early would make the API harder to evolve. The first milestone focuses on:

- correct core behavior;
- stable types;
- real browser demo;
- strong test coverage;
- safe npm publication.
