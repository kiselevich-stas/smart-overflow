import type { CalculateOverflowInput, SmartOverflowItem } from './types';

const assertFiniteNumber = (name: string, value: number): void => {
  if (!Number.isFinite(value)) {
    throw new TypeError(`SmartOverflow: ${name} must be a finite number.`);
  }
};

const assertNonNegativeNumber = (name: string, value: number): void => {
  assertFiniteNumber(name, value);

  if (value < 0) {
    throw new RangeError(`SmartOverflow: ${name} must be greater than or equal to 0.`);
  }
};

export const normalizeNonNegativeNumber = (name: string, value: number | undefined, fallback: number): number => {
  const normalized = value ?? fallback;
  assertNonNegativeNumber(name, normalized);
  return normalized;
};

export const normalizeMinVisibleItems = (value: number | undefined): number => {
  const normalized = value ?? 0;
  assertNonNegativeNumber('minVisibleItems', normalized);

  if (!Number.isInteger(normalized)) {
    throw new TypeError('SmartOverflow: minVisibleItems must be an integer.');
  }

  return normalized;
};

export const validateItems = <TMeta>(items: readonly SmartOverflowItem<TMeta>[]): void => {
  const seenIds = new Set<SmartOverflowItem['id']>();

  for (const item of items) {
    if (seenIds.has(item.id)) {
      throw new Error(`SmartOverflow: duplicate item id "${String(item.id)}".`);
    }

    seenIds.add(item.id);
    assertNonNegativeNumber(`width for item "${String(item.id)}"`, item.width);

    if (item.priority !== undefined) {
      assertFiniteNumber(`priority for item "${String(item.id)}"`, item.priority);
    }
  }
};

export const validateInput = <TMeta>(input: CalculateOverflowInput<TMeta>): void => {
  validateItems(input.items);
  assertNonNegativeNumber('containerWidth', input.containerWidth);

  if (input.overflowIndicatorWidth !== undefined) {
    assertNonNegativeNumber('overflowIndicatorWidth', input.overflowIndicatorWidth);
  }

  if (input.gap !== undefined) {
    assertNonNegativeNumber('gap', input.gap);
  }
};
