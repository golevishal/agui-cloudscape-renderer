import { deepMerge } from '../utils/stateUtils';

/**
 * External store for A2UI reactive state. Components subscribe via
 * `useSyncExternalStore` through the `useA2UIStateProperty` hook.
 */
export class A2UIStore {
  private state: Record<string, unknown> = {};
  private listeners = new Set<() => void>();

  setState(newState: Record<string, unknown>) {
    this.state = newState;
    this.notify();
  }

  mergeState(partialState: Record<string, unknown>) {
    const nextState = deepMerge(this.state, partialState) as Record<string, unknown>;
    if (nextState !== this.state) {
      this.state = nextState;
      this.notify();
    }
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.state;
}
