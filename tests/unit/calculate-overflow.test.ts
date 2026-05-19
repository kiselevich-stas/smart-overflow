import { describe, expect, it } from 'vitest';
import { calculateOverflow, type SmartOverflowItem } from '../../src';

const items: SmartOverflowItem[] = [
  { id: 'edit', width: 48 },
  { id: 'delete', width: 64 },
  { id: 'duplicate', width: 92 },
  { id: 'export', width: 72 },
];

describe('calculateOverflow', () => {
  it('keeps all items visible when the content fits', () => {
    const result = calculateOverflow({
      containerWidth: 400,
      overflowIndicatorWidth: 56,
      gap: 8,
      items,
    });

    expect(result.visibleIds).toEqual(['edit', 'delete', 'duplicate', 'export']);
    expect(result.hiddenIds).toEqual([]);
    expect(result.overflowIndicatorVisible).toBe(false);
    expect(result.isOverflowing).toBe(false);
  });

  it('collapses items from the end by default and accounts for the overflow indicator width', () => {
    const result = calculateOverflow({
      containerWidth: 190,
      overflowIndicatorWidth: 56,
      gap: 8,
      items,
    });

    expect(result.visibleIds).toEqual(['edit', 'delete']);
    expect(result.hiddenIds).toEqual(['duplicate', 'export']);
    expect(result.overflowIndicatorVisible).toBe(true);
    expect(result.usedWidth).toBe(48 + 64 + 56 + 8 * 2);
  });

  it('supports start-collapse for breadcrumbs and leading-overflow layouts', () => {
    const result = calculateOverflow({
      containerWidth: 190,
      overflowIndicatorWidth: 56,
      gap: 8,
      strategy: 'collapse-start',
      items,
    });

    expect(result.visibleIds).toEqual(['export']);
    expect(result.hiddenIds).toEqual(['edit', 'delete', 'duplicate']);
  });

  it('supports priority-based placement while preserving original output order', () => {
    const result = calculateOverflow({
      containerWidth: 220,
      overflowIndicatorWidth: 56,
      gap: 8,
      strategy: 'priority',
      items: [
        { id: 'edit', width: 48, priority: 100 },
        { id: 'delete', width: 64, priority: 80 },
        { id: 'duplicate', width: 92, priority: 10 },
        { id: 'export', width: 72, priority: 50 },
      ],
    });

    expect(result.visibleIds).toEqual(['edit', 'delete']);
    expect(result.hiddenIds).toEqual(['duplicate', 'export']);
    expect(result.hiddenItems.map((item) => item.reason)).toEqual([
      'hidden-by-priority',
      'hidden-by-priority',
    ]);
  });

  it('never intentionally hides pinned items', () => {
    const result = calculateOverflow({
      containerWidth: 130,
      overflowIndicatorWidth: 56,
      gap: 8,
      items: [
        { id: 'save', width: 100, pinned: true },
        { id: 'copy', width: 80 },
        { id: 'share', width: 80 },
      ],
    });

    expect(result.visibleIds).toEqual(['save']);
    expect(result.hiddenIds).toEqual(['copy', 'share']);
    expect(result.visibleItems[0]?.reason).toBe('pinned');
    expect(result.isOverflowing).toBe(true);
  });

  it('respects minVisibleItems and reports remaining overflow when the minimum cannot fit', () => {
    const result = calculateOverflow({
      containerWidth: 120,
      overflowIndicatorWidth: 56,
      gap: 8,
      minVisibleItems: 2,
      items: [
        { id: 'a', width: 80 },
        { id: 'b', width: 80 },
        { id: 'c', width: 80 },
      ],
    });

    expect(result.visibleIds).toEqual(['a', 'b']);
    expect(result.hiddenIds).toEqual(['c']);
    expect(result.isOverflowing).toBe(true);
    expect(result.remainingOverflowWidth).toBeGreaterThan(0);
  });

  it('handles empty input', () => {
    const result = calculateOverflow({
      containerWidth: 0,
      overflowIndicatorWidth: 56,
      gap: 8,
      items: [],
    });

    expect(result.visibleIds).toEqual([]);
    expect(result.hiddenIds).toEqual([]);
    expect(result.usedWidth).toBe(0);
  });

  it('throws on duplicate item ids', () => {
    expect(() =>
      calculateOverflow({
        containerWidth: 100,
        items: [
          { id: 'duplicate', width: 40 },
          { id: 'duplicate', width: 40 },
        ],
      }),
    ).toThrow(/duplicate item id/);
  });

  it('throws on invalid widths', () => {
    expect(() =>
      calculateOverflow({
        containerWidth: 100,
        items: [{ id: 'broken', width: Number.NaN }],
      }),
    ).toThrow(/finite number/);

    expect(() =>
      calculateOverflow({
        containerWidth: -1,
        items: [],
      }),
    ).toThrow(/greater than or equal to 0/);
  });
});
