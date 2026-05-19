import { calculateOverflow } from './core';
import type {
  CalculateOverflowInput,
  SmartOverflowListener,
  SmartOverflowResult,
} from './types';

const areIdListsEqual = (left: readonly unknown[], right: readonly unknown[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => Object.is(value, right[index]));
};

const areResultsEquivalent = <TMeta>(
  left: SmartOverflowResult<TMeta>,
  right: SmartOverflowResult<TMeta>,
): boolean =>
  areIdListsEqual(left.visibleIds, right.visibleIds) &&
  areIdListsEqual(left.hiddenIds, right.hiddenIds) &&
  left.overflowIndicatorVisible === right.overflowIndicatorVisible &&
  Object.is(left.usedWidth, right.usedWidth) &&
  Object.is(left.remainingOverflowWidth, right.remainingOverflowWidth) &&
  left.isOverflowing === right.isOverflowing;

/**
 * Small observable wrapper around calculateOverflow.
 *
 * It is useful when your UI layer already owns measurements and wants a stateful core
 * without pulling in any framework adapter.
 */
export class SmartOverflowEngine<TMeta = unknown> {
  readonly #listeners = new Set<SmartOverflowListener<TMeta>>();
  #input: CalculateOverflowInput<TMeta>;
  #result: SmartOverflowResult<TMeta>;

  constructor(input: CalculateOverflowInput<TMeta>) {
    this.#input = input;
    this.#result = calculateOverflow(input);
  }

  get input(): CalculateOverflowInput<TMeta> {
    return this.#input;
  }

  get result(): SmartOverflowResult<TMeta> {
    return this.#result;
  }

  /** Replace the full input and notify listeners only when the calculated result changed. */
  update(input: CalculateOverflowInput<TMeta>): SmartOverflowResult<TMeta> {
    this.#input = input;
    const nextResult = calculateOverflow(input);

    if (!areResultsEquivalent(this.#result, nextResult)) {
      this.#result = nextResult;
      this.#emit(nextResult);
    } else {
      this.#result = nextResult;
    }

    return this.#result;
  }

  /** Patch the current input and recalculate. */
  patch(input: Partial<CalculateOverflowInput<TMeta>>): SmartOverflowResult<TMeta> {
    return this.update({ ...this.#input, ...input });
  }

  /** Subscribe to result changes. Returns an unsubscribe function. */
  subscribe(listener: SmartOverflowListener<TMeta>, options: { emitImmediately?: boolean } = {}): () => void {
    this.#listeners.add(listener);

    if (options.emitImmediately) {
      listener(this.#result);
    }

    return () => {
      this.#listeners.delete(listener);
    };
  }

  /** Remove all listeners. */
  destroy(): void {
    this.#listeners.clear();
  }

  #emit(result: SmartOverflowResult<TMeta>): void {
    for (const listener of this.#listeners) {
      listener(result);
    }
  }
}
