import { createContext, useContext } from 'react';
import type React from 'react';

export interface LayoutContextType {
  setSurface: (id: string, node: React.ReactNode) => void;
  setToolsOpen: (open: boolean) => void;
}

export const LayoutContext = createContext<LayoutContextType | null>(null);

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used within LayoutContext');
  return ctx;
}
