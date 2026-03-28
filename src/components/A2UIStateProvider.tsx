import type { ReactNode } from 'react';
import type { A2UIStore } from '../stores/A2UIStore';
import { A2UIStoreContext } from '../contexts/A2UIStoreContext';

export function A2UIStateProvider({ store, children }: { store: A2UIStore; children: ReactNode }) {
  return <A2UIStoreContext.Provider value={store}>{children}</A2UIStoreContext.Provider>;
}
