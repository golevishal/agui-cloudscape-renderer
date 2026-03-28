import { createContext, useContext, useCallback, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';

// Utility for deep merging simple objects, treating arrays as full replacements.
function deepMerge(target: any, source: any): any {
  if (target === source) return target;
  if (typeof target !== 'object' || target === null) return source;
  if (typeof source !== 'object' || source === null) return source;
  
  if (Array.isArray(target) && Array.isArray(source)) {
    return source; 
  }

  const result = { ...target };
  for (const key of Object.keys(source)) {
    result[key] = deepMerge(result[key], source[key]); // use result[key] incase we need to deep merge existing copied object
  }
  return result;
}

// Utility to resolve JSON Pointers
export function resolvePointer(state: any, pointer: string): any {
  if (!pointer) return pointer;
  
  let pathString = pointer;
  if (pathString.startsWith('$/')) {
    pathString = pathString.slice(2);
  } else if (pathString.startsWith('#/')) {
    pathString = pathString.slice(2);
  } else if (pathString.startsWith('$')) {
    pathString = pathString.slice(1);
  } else {
    // Not a valid pointer string
    return undefined;
  }
  
  if (!pathString) return state; // root
  
  const path = pathString.split('/');
  let current = state;
  for (const key of path) {
    if (current == null) return undefined;
    // Decode JSON Pointer escape sequences RFC 6901
    const unescapedKey = key.replace(/~1/g, '/').replace(/~0/g, '~');
    current = current[unescapedKey];
  }
  return current;
}

export class A2UIStore {
  private state: Record<string, unknown> = {};
  private listeners = new Set<() => void>();

  setState(newState: Record<string, unknown>) {
    this.state = newState;
    this.notify();
  }

  mergeState(partialState: Record<string, unknown>) {
    const nextState = deepMerge(this.state, partialState);
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

export const A2UIStoreContext = createContext<A2UIStore | null>(null);

export function A2UIStateProvider({ store, children }: { store: A2UIStore; children: ReactNode }) {
  return <A2UIStoreContext.Provider value={store}>{children}</A2UIStoreContext.Provider>;
}

export function useA2UIStore() {
  const store = useContext(A2UIStoreContext);
  if (!store) throw new Error("Missing A2UIStoreContext.Provider");
  return store;
}

/**
 * Returns the resolved value of a property if it is a JSON pointer string.
 * Otherwise returns the property unmodified.
 * Uses useSyncExternalStore internally to subscribe only to the accessed property value,
 * which implements granular component re-rendering.
 */
export function useA2UIStateProperty<T>(value: T): T {
  const store = useContext(A2UIStoreContext);
  
  const isPointer = typeof value === 'string' && (value.startsWith('#/') || value.startsWith('$/') || value.startsWith('$'));

  const getSnapshot = useCallback(() => {
    if (!store) return value;
    const state = store.getSnapshot();
    if (isPointer) {
      const resolved = resolvePointer(state, value as unknown as string);
      return resolved !== undefined ? (resolved as unknown as T) : value;
    }
    return value;
  }, [store, value, isPointer]);

  const subscribe = useCallback((onStoreChange: () => void) => {
    return store ? store.subscribe(onStoreChange) : () => {};
  }, [store]);
  
  return useSyncExternalStore(subscribe, getSnapshot);
}
