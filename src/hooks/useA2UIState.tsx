import { useContext, useCallback, useSyncExternalStore } from 'react';
import { A2UIStoreContext } from '../contexts/A2UIStoreContext';
import { resolvePointer } from '../utils/stateUtils';

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
