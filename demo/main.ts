import { calculateOverflow, type SmartOverflowItem } from '../src';
import './styles.css';

type ActionMeta = {
  label: string;
  priority: number;
  pinned?: boolean;
};

const toolbar = document.querySelector<HTMLElement>('[data-testid="toolbar"]');
const widthSlider = document.querySelector<HTMLInputElement>('[data-testid="width-slider"]');
const widthOutput = document.querySelector<HTMLOutputElement>('[data-testid="width-output"]');
const moreWrapper = document.querySelector<HTMLElement>('[data-testid="more-wrapper"]');
const moreButton = document.querySelector<HTMLButtonElement>('[data-testid="more-button"]');
const moreMenu = document.querySelector<HTMLElement>('[data-testid="more-menu"]');
const debugOutput = document.querySelector<HTMLElement>('[data-testid="debug-output"]');
const actionButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-action-id]'));

if (!toolbar || !widthSlider || !widthOutput || !moreWrapper || !moreButton || !moreMenu || !debugOutput) {
  throw new Error('SmartOverflow demo markup is incomplete.');
}

const actionMetaById = new Map<string, ActionMeta>([
  ['edit', { label: 'Edit', priority: 100, pinned: true }],
  ['delete', { label: 'Delete', priority: 80 }],
  ['duplicate', { label: 'Duplicate', priority: 40 }],
  ['export', { label: 'Export', priority: 60 }],
  ['share', { label: 'Share', priority: 30 }],
  ['archive', { label: 'Archive', priority: 10 }],
]);

const getToolbarAvailableWidth = (targetWidth: number): number => {
  const styles = window.getComputedStyle(toolbar);

  const horizontalPadding =
    Number.parseFloat(styles.paddingLeft) + Number.parseFloat(styles.paddingRight);

  const horizontalBorder =
    Number.parseFloat(styles.borderLeftWidth) + Number.parseFloat(styles.borderRightWidth);

  return Math.max(0, targetWidth - horizontalPadding - horizontalBorder);
};

const getMeasuredItems = (): SmartOverflowItem<ActionMeta>[] => {
  for (const button of actionButtons) {
    button.hidden = false;
  }

  moreWrapper.hidden = false;

  return actionButtons.map((button) => {
    const id = button.dataset.actionId;

    if (!id) {
      throw new Error('Every demo button must have data-action-id.');
    }

    const meta = actionMetaById.get(id);

    if (!meta) {
      throw new Error(`Unknown demo action "${id}".`);
    }

    return {
      id,
      width: button.getBoundingClientRect().width,
      priority: meta.priority,
      pinned: meta.pinned ?? false,
      meta,
    };
  });
};

const closeMenu = (): void => {
  moreMenu.hidden = true;
  moreButton.setAttribute('aria-expanded', 'false');
};

const render = (): void => {
  const containerWidth = Number(widthSlider.value);

  toolbar.style.width = `${String(containerWidth)}px`;
  widthOutput.value = `${String(containerWidth)}px`;

  closeMenu();

  const items = getMeasuredItems();

  const result = calculateOverflow({
    containerWidth: getToolbarAvailableWidth(containerWidth),
    overflowIndicatorWidth: moreButton.getBoundingClientRect().width,
    gap: 8,
    strategy: 'priority',
    minVisibleItems: 1,
    items,
  });

  const hiddenIds = new Set(result.hiddenIds.map(String));

  for (const button of actionButtons) {
    const id = button.dataset.actionId;
    button.hidden = Boolean(id && hiddenIds.has(id));
  }

  moreWrapper.hidden = !result.overflowIndicatorVisible;

  moreMenu.replaceChildren(
    ...result.hiddenItems.map((item) => {
      const menuItem = document.createElement('button');

      menuItem.type = 'button';
      menuItem.setAttribute('role', 'menuitem');
      menuItem.textContent = item.meta?.label ?? String(item.id);
      menuItem.dataset.overflowId = String(item.id);

      return menuItem;
    }),
  );

  debugOutput.textContent = JSON.stringify(
    {
      visible: result.visibleIds,
      hidden: result.hiddenIds,
      usedWidth: Math.round(result.usedWidth),
      isOverflowing: result.isOverflowing,
    },
    null,
    2,
  );
};

widthSlider.addEventListener('input', render);

moreButton.addEventListener('click', () => {
  const nextExpanded = moreButton.getAttribute('aria-expanded') !== 'true';

  moreButton.setAttribute('aria-expanded', String(nextExpanded));
  moreMenu.hidden = !nextExpanded;
});

document.addEventListener('click', (event) => {
  if (event.target instanceof Node && !moreWrapper.contains(event.target)) {
    closeMenu();
  }
});

render();
