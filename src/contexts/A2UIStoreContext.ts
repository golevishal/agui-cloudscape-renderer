import { createContext } from 'react';
import type { A2UIStore } from '../stores/A2UIStore';

export const A2UIStoreContext = createContext<A2UIStore | null>(null);
