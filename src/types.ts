/** A stable item identifier. Use values that also work as DOM keys in your UI layer. */
export type SmartOverflowItemId = string | number;

/** Strategy that decides which hideable item is moved to overflow first. */
export type SmartOverflowStrategy =
  /** Hide items from the end first. This matches most toolbar/action-bar behavior. */
  | 'collapse-end'
  /** Hide items from the start first. Useful for breadcrumbs or left-growing navigation. */
  | 'collapse-start'
  /** Hide lower-priority items first. Ties are collapsed from the end. */
  | 'priority';

/** Reason why an item is currently visible or hidden. */
export type SmartOverflowReason =
  | 'fits'
  | 'hidden-by-end-collapse'
  | 'hidden-by-start-collapse'
  | 'hidden-by-priority'
  | 'pinned'
  | 'min-visible-items'
  | 'not-enough-space';

/** A measurable UI item. The library does not care whether it is a button, tab, link or chip. */
export type SmartOverflowItem<TMeta = unknown> = {
  /** Stable identifier returned in visibleIds and hiddenIds. */
  id: SmartOverflowItemId;
  /** Measured outer width of the item in CSS pixels. Fractions are allowed. */
  width: number;
  /** Higher priority means the item should remain visible longer. Default: 0. */
  priority?: number;
  /** Pinned items are never intentionally moved into overflow. Default: false. */
  pinned?: boolean;
  /** Optional application metadata. It is copied through without being inspected. */
  meta?: TMeta;
};

/** Input for the pure overflow calculation. */
export type CalculateOverflowInput<TMeta = unknown> = {
  /** Available inner width of the container in CSS pixels. */
  containerWidth: number;
  /** Width of the overflow indicator, for example a “More” button. Default: 0. */
  overflowIndicatorWidth?: number;
  /** Gap between visible items and the overflow indicator. Default: 0. */
  gap?: number;
  /** Minimum number of non-pinned items to keep visible when possible. Default: 0. */
  minVisibleItems?: number;
  /** Strategy used to select the next hideable item. Default: 'collapse-end'. */
  strategy?: SmartOverflowStrategy;
  /** Items in their visual order. */
  items: readonly SmartOverflowItem<TMeta>[];
};

/** One item with calculated placement. */
export type SmartOverflowPlacement<TMeta = unknown> = SmartOverflowItem<TMeta> & {
  /** Original index in the input array. */
  index: number;
  /** Whether the item should be rendered in the main row. */
  visible: boolean;
  /** Why the item ended in this placement. Useful for debugging and tests. */
  reason: SmartOverflowReason;
};

/** Result returned by calculateOverflow and SmartOverflowEngine. */
export type SmartOverflowResult<TMeta = unknown> = {
  /** Items that should be rendered in the main container, in original order. */
  visibleItems: SmartOverflowPlacement<TMeta>[];
  /** Items that should be rendered under overflow, in original order. */
  hiddenItems: SmartOverflowPlacement<TMeta>[];
  /** Convenience list of visible ids. */
  visibleIds: SmartOverflowItemId[];
  /** Convenience list of hidden ids. */
  hiddenIds: SmartOverflowItemId[];
  /** Whether the overflow indicator should be rendered. */
  overflowIndicatorVisible: boolean;
  /** Calculated width used by visible items plus gap plus indicator when present. */
  usedWidth: number;
  /** True when required content still cannot fit, usually because pinned/min-visible items are too wide. */
  isOverflowing: boolean;
  /** Positive number of CSS pixels that still do not fit. */
  remainingOverflowWidth: number;
  /** Normalized input options used by the algorithm. */
  options: Required<Pick<CalculateOverflowInput<TMeta>, 'containerWidth' | 'overflowIndicatorWidth' | 'gap' | 'minVisibleItems' | 'strategy'>>;
};

/** Listener used by SmartOverflowEngine.subscribe. */
export type SmartOverflowListener<TMeta = unknown> = (result: SmartOverflowResult<TMeta>) => void;
