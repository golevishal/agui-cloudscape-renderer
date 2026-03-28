import { AppLayout, SideNavigation } from '@cloudscape-design/components';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Demo from './pages/Demo';
import Playground from './pages/Playground';

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
  return (
    <AppLayout
      navigation={<Navigation />}
      content={
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Demo />} />
            <Route path="/playground" element={<Playground />} />
          </Routes>
        </ErrorBoundary>
      }
      toolsHide
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}
