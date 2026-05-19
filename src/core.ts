import {
  normalizeMinVisibleItems,
  normalizeNonNegativeNumber,
  validateInput,
} from './guards';
import type {
  CalculateOverflowInput,
  SmartOverflowPlacement,
  SmartOverflowReason,
  SmartOverflowResult,
  SmartOverflowStrategy,
} from './types';

type NormalizedOptions<TMeta> = Required<
  Pick<
    CalculateOverflowInput<TMeta>,
    'containerWidth' | 'overflowIndicatorWidth' | 'gap' | 'minVisibleItems' | 'strategy'
  >
>;

type WorkingPlacement<TMeta> = SmartOverflowPlacement<TMeta> & {
  lockedVisible: boolean;
};

const DEFAULT_STRATEGY: SmartOverflowStrategy = 'collapse-end';

const normalizeOptions = <TMeta>(input: CalculateOverflowInput<TMeta>): NormalizedOptions<TMeta> => ({
  containerWidth: input.containerWidth,
  overflowIndicatorWidth: normalizeNonNegativeNumber(
    'overflowIndicatorWidth',
    input.overflowIndicatorWidth,
    0,
  ),
  gap: normalizeNonNegativeNumber('gap', input.gap, 0),
  minVisibleItems: normalizeMinVisibleItems(input.minVisibleItems),
  strategy: input.strategy ?? DEFAULT_STRATEGY,
});

const getGapWidth = (visibleCount: number, hasOverflowIndicator: boolean, gap: number): number => {
  const renderedUnits = visibleCount + (hasOverflowIndicator ? 1 : 0);
  return renderedUnits > 1 ? (renderedUnits - 1) * gap : 0;
};

const getUsedWidth = <TMeta>(placements: readonly WorkingPlacement<TMeta>[], options: NormalizedOptions<TMeta>): number => {
  const visibleItems = placements.filter((item) => item.visible);
  const hasOverflowIndicator = placements.some((item) => !item.visible);
  const itemsWidth = visibleItems.reduce((total, item) => total + item.width, 0);
  const indicatorWidth = hasOverflowIndicator ? options.overflowIndicatorWidth : 0;
  const gapWidth = getGapWidth(visibleItems.length, hasOverflowIndicator, options.gap);

  return itemsWidth + indicatorWidth + gapWidth;
};

const getHideReason = (strategy: SmartOverflowStrategy): SmartOverflowReason => {
  switch (strategy) {
    case 'collapse-start':
      return 'hidden-by-start-collapse';
    case 'priority':
      return 'hidden-by-priority';
    case 'collapse-end':
      return 'hidden-by-end-collapse';
  }
};

const getHideOrder = <TMeta>(
  placements: readonly WorkingPlacement<TMeta>[],
  strategy: SmartOverflowStrategy,
): WorkingPlacement<TMeta>[] => {
  const hideable = placements.filter((item) => !item.pinned);

  switch (strategy) {
    case 'collapse-start':
      return [...hideable].sort((left, right) => left.index - right.index);
    case 'priority':
      return [...hideable].sort((left, right) => {
        const priorityDiff = (left.priority ?? 0) - (right.priority ?? 0);
        return priorityDiff === 0 ? right.index - left.index : priorityDiff;
      });
    case 'collapse-end':
      return [...hideable].sort((left, right) => right.index - left.index);
  }
};

const countVisibleHideableItems = <TMeta>(placements: readonly WorkingPlacement<TMeta>[]): number =>
  placements.filter((item) => item.visible && !item.pinned).length;

const canHideItem = <TMeta>(
  item: WorkingPlacement<TMeta>,
  placements: readonly WorkingPlacement<TMeta>[],
  minVisibleItems: number,
): boolean => {
  if (!item.visible || item.pinned || item.lockedVisible) {
    return false;
  }

  return countVisibleHideableItems(placements) > minVisibleItems;
};

const toPublicResult = <TMeta>(
  placements: readonly WorkingPlacement<TMeta>[],
  options: NormalizedOptions<TMeta>,
): SmartOverflowResult<TMeta> => {
  const usedWidth = getUsedWidth(placements, options);
  const remainingOverflowWidth = Math.max(0, usedWidth - options.containerWidth);
  const publicPlacements = placements.map(({ lockedVisible, ...placement }) => {
    void lockedVisible;
    return placement;
  });
  const visibleItems = publicPlacements.filter((item) => item.visible);
  const hiddenItems = publicPlacements.filter((item) => !item.visible);

  return {
    visibleItems,
    hiddenItems,
    visibleIds: visibleItems.map((item) => item.id),
    hiddenIds: hiddenItems.map((item) => item.id),
    overflowIndicatorVisible: hiddenItems.length > 0,
    usedWidth,
    isOverflowing: remainingOverflowWidth > 0,
    remainingOverflowWidth,
    options,
  };
};

/**
 * Calculates which items should stay visible and which should move into overflow.
 *
 * This function is pure, deterministic and framework-agnostic. It performs no DOM reads,
 * writes, timers, observers or network requests.
 */
export const calculateOverflow = <TMeta = unknown>(
  input: CalculateOverflowInput<TMeta>,
): SmartOverflowResult<TMeta> => {
  validateInput(input);

  const options = normalizeOptions(input);
  const placements: WorkingPlacement<TMeta>[] = input.items.map((item, index) => ({
    ...item,
    index,
    visible: true,
    reason: item.pinned ? 'pinned' : 'fits',
    lockedVisible: false,
  }));

  const hideOrder = getHideOrder(placements, options.strategy);
  const hideReason = getHideReason(options.strategy);

  for (const itemToHide of hideOrder) {
    const usedWidth = getUsedWidth(placements, options);

    if (usedWidth <= options.containerWidth) {
      break;
    }

    if (!canHideItem(itemToHide, placements, options.minVisibleItems)) {
      itemToHide.reason = itemToHide.pinned ? 'pinned' : 'min-visible-items';
      itemToHide.lockedVisible = true;
      continue;
    }

    itemToHide.visible = false;
    itemToHide.reason = hideReason;
  }

  const remainingUsedWidth = getUsedWidth(placements, options);

  if (remainingUsedWidth > options.containerWidth) {
    for (const placement of placements) {
      if (placement.visible && !placement.pinned && placement.reason === 'fits') {
        placement.reason = 'not-enough-space';
      }
    }
  }

  return toPublicResult(placements, options);
};
