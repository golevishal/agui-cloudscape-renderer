import { useEffect, useRef } from 'react';
import ProtocolBridge from '../components/ProtocolBridge';
import TraceSidebar from '../components/TraceSidebar';
import { useAgUiEvents } from '../hooks/useAgUiEvents';
import { useLayout } from '../App';

export default function Demo() {
  const { events, emitEvent } = useAgUiEvents();
  const { setSurface, setToolsOpen } = useLayout();
  const mountedRef = useRef(false);

  // Set up the tools panel once on mount, tear down on unmount.
  // TraceSidebar updates are handled internally via its own props/state —
  // we do NOT recreate or re-set the surface node on every events change.
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      setToolsOpen(true);
    }
    return () => {
      setSurface('tools', null);
      setToolsOpen(false);
    };
  }, [setSurface, setToolsOpen]);

  return (
    <>
      <ProtocolBridge events={events} emitEvent={emitEvent} />
      <TraceSidebarPortal events={events} />
    </>
  );
}

/**
 * This component manages the TraceSidebar slot declaratively.
 * It renders a hidden <div> with a ref, and uses a layout effect
 * to project its content into the AppLayout tools slot.
 */
function TraceSidebarPortal({ events }: { events: import('../types/agui').AgUiEvent[] }) {
  const { setSurface } = useLayout();
  const nodeRef = useRef<React.ReactNode>(null);

  // Only update the surface when the events array identity actually changes
  const prevEventsRef = useRef(events);
  if (prevEventsRef.current !== events) {
    prevEventsRef.current = events;
    nodeRef.current = <TraceSidebar events={events} />;
    setSurface('tools', nodeRef.current);
  }

  // Set initial value
  useEffect(() => {
    nodeRef.current = <TraceSidebar events={events} />;
    setSurface('tools', nodeRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
