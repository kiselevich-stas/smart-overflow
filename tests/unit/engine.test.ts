import { describe, expect, it, vi } from 'vitest';
import { SmartOverflowEngine } from '../../src';

const baseInput = {
  containerWidth: 300,
  overflowIndicatorWidth: 56,
  gap: 8,
  items: [
    { id: 'edit', width: 48 },
    { id: 'delete', width: 64 },
    { id: 'duplicate', width: 92 },
  ],
};

describe('SmartOverflowEngine', () => {
  it('calculates initial result', () => {
    const engine = new SmartOverflowEngine(baseInput);

    expect(engine.result.visibleIds).toEqual(['edit', 'delete', 'duplicate']);
    expect(engine.result.hiddenIds).toEqual([]);
  });

  it('emits immediately when requested', () => {
    const engine = new SmartOverflowEngine(baseInput);
    const listener = vi.fn();

    engine.subscribe(listener, { emitImmediately: true });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(engine.result);
  });

  it('notifies listeners only when calculated placement changes', () => {
    const engine = new SmartOverflowEngine(baseInput);
    const listener = vi.fn();
    engine.subscribe(listener);

    engine.patch({ containerWidth: 290 });
    expect(listener).toHaveBeenCalledTimes(0);

    engine.patch({ containerWidth: 150 });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(engine.result.hiddenIds).toEqual(['delete', 'duplicate']);
  });

  it('supports unsubscribe', () => {
    const engine = new SmartOverflowEngine(baseInput);
    const listener = vi.fn();
    const unsubscribe = engine.subscribe(listener);

    unsubscribe();
    engine.patch({ containerWidth: 150 });

    expect(listener).not.toHaveBeenCalled();
  });

  it('removes all listeners on destroy', () => {
    const engine = new SmartOverflowEngine(baseInput);
    const listener = vi.fn();

    engine.subscribe(listener);
    engine.destroy();
    engine.patch({ containerWidth: 150 });

    expect(listener).not.toHaveBeenCalled();
  });
});
