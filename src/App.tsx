import React, { useState, createContext, useContext, useCallback, useMemo } from 'react';
import { AppLayout, SideNavigation } from '@cloudscape-design/components';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Demo from './pages/Demo';
import Playground from './pages/Playground';

interface LayoutContextType {
  setSurface: (id: string, node: React.ReactNode) => void;
  setToolsOpen: (open: boolean) => void;
}

export const LayoutContext = createContext<LayoutContextType | null>(null);

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used within LayoutContext');
  return ctx;
}

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SideNavigation
      activeHref={location.pathname}
      header={{ href: '/', text: 'AUI Simulator' }}
      onFollow={event => {
        if (!event.detail.external) {
          event.preventDefault();
          navigate(event.detail.href);
        }
      }}
      items={[
        { type: 'link', text: 'Live Agent Demo', href: '/' },
        { type: 'link', text: 'Protocol Playground', href: '/playground' }
      ]}
    />
  );
}

function MainLayout() {
  const [surfaces, setSurfaces] = useState<Record<string, React.ReactNode>>({});
  const [toolsOpen, setToolsOpen] = useState(false);

  const setSurface = useCallback((id: string, node: React.ReactNode) => {
    setSurfaces(prev => {
      if (prev[id] === node) return prev;
      return { ...prev, [id]: node };
    });
  }, []);

  const layoutContextValue = useMemo(() => ({ setSurface, setToolsOpen }), [setSurface]);

  return (
    <LayoutContext.Provider value={layoutContextValue}>
      <AppLayout
        navigation={surfaces['navigation'] || <Navigation />}
        tools={surfaces['tools'] || null}
        toolsOpen={toolsOpen}
        onToolsChange={e => setToolsOpen(e.detail.open)}
        toolsHide={!surfaces['tools']}
        content={
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Demo />} />
            <Route path="/playground" element={<Playground />} />
          </Routes>
        </ErrorBoundary>
      }
      />
    </LayoutContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}
