import React, { useState, useEffect, useRef } from 'react';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Alert from '@cloudscape-design/components/alert';
import A2UITableRenderer from './A2UITableRenderer';
import SurfaceRenderer from './SurfaceRenderer';
import A2UIPropertyRedact from './A2UIPropertyRedact';
import A2UIRenderer from './A2UIRenderer';
import { A2UIStore } from '../stores/A2UIStore';
import { A2UIStateProvider } from './A2UIStateProvider';
import { useA2UIStore } from '../hooks/useA2UIState';
import { useLayout } from '../hooks/useLayout';
import type { AgUiEvent, OutboundClientEvent, A2UITablePayload, A2UIPropertyRedactPayload, A2UICatalogPayload } from '../types/agui';

interface ProtocolBridgeProps {
  events: AgUiEvent[];
  emitEvent: (event: OutboundClientEvent) => Promise<void>;
}

interface PayloadWithSurface {
  surface?: string;
}

export default function ProtocolBridge({ events, emitEvent }: ProtocolBridgeProps) {
  const [store] = useState(() => new A2UIStore());
  const processedLengthRef = useRef(0);

  // Process DATA_MODEL_UPDATE events in an effect instead of during render
  useEffect(() => {
    if (events.length > processedLengthRef.current) {
      const newEvents = events.slice(processedLengthRef.current);
      for (const event of newEvents) {
        if (event.type === 'DATA_MODEL_UPDATE') {
          store.mergeState(event.payload);
        }
      }
      processedLengthRef.current = events.length;
    }
  }, [events, store]);

  // Group events by target surface ID
  const activeSurfaces = React.useMemo(() => {
    const map: Record<string, AgUiEvent> = {};
    for (const e of events) {
      if (e.type === 'DATA_MODEL_UPDATE' || e.type === 'TOOL_CALL_END') continue;
      const payload = e.payload as PayloadWithSurface;
      const s = payload.surface || 'main';
      map[s] = e;
    }
    return map;
  }, [events]);

  if (events.length === 0) {
    return <StatusIndicator type="info">Waiting for AG-UI events...</StatusIndicator>;
  }

  return (
    <A2UIStateProvider store={store}>
      {/* the default view */}
      {activeSurfaces['main'] ? (
        <EventRenderer event={activeSurfaces['main']} emitEvent={emitEvent} />
      ) : (
        <StatusIndicator type="info">Evaluating State Updates...</StatusIndicator>
      )}

      {/* other active layout portals */}
      {Object.entries(activeSurfaces).map(([id, event]) => {
        if (id === 'main') return null;
        return <SurfacePortal key={id} id={id} event={event} emitEvent={emitEvent} />;
      })}
    </A2UIStateProvider>
  );
}

function SurfacePortal({ id, event, emitEvent }: { id: string, event: AgUiEvent, emitEvent: (event: OutboundClientEvent) => Promise<void> }) {
  const { setSurface, setToolsOpen } = useLayout();
  const store = useA2UIStore();
  const prevEventRef = React.useRef<AgUiEvent | null>(null);
  const nodeRef = React.useRef<React.ReactNode>(null);

  // Only create new JSX and call setSurface when the event identity actually changes
  if (prevEventRef.current !== event) {
    prevEventRef.current = event;
    nodeRef.current = (
      <A2UIStateProvider store={store}>
        <EventRenderer event={event} emitEvent={emitEvent} />
      </A2UIStateProvider>
    );
    setSurface(id, nodeRef.current);
    if (id === 'tools') setToolsOpen(true);
  }

  // Cleanup on unmount
  React.useEffect(() => {
    return () => setSurface(id, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return null;
}

function EventRenderer({ event, emitEvent }: { event: AgUiEvent, emitEvent: (event: OutboundClientEvent) => Promise<void> }) {
  switch (event.type) {
    case 'ACTION_REQUIRED':
      return <SurfaceRenderer payload={event.payload} onSubmit={emitEvent} />;
    case 'TOOL_CALL_START':
      return (
        <StatusIndicator type="loading">
          Agent is working: {event.payload.description || event.payload.toolName}
        </StatusIndicator>
      );
    case 'STATE_DELTA':
      return (
        <Alert type="info" header={event.payload.state}>
          {event.payload.message}
        </Alert>
      );
    case 'A2UI_RENDER':
      if ('rootId' in event.payload) {
        const catalogPayload = event.payload as A2UICatalogPayload;
        return <A2UIRenderer rootId={catalogPayload.rootId} components={catalogPayload.components} />;
      } else if ('componentName' in event.payload && event.payload.componentName === 'Table') {
        return <A2UITableRenderer payload={event.payload as A2UITablePayload} />;
      } else if ('componentName' in event.payload && event.payload.componentName === 'PropertyRedact') {
        return <A2UIPropertyRedact payload={event.payload as A2UIPropertyRedactPayload} />;
      }
      return <Alert type="error">Unknown render payload</Alert>;
    default:
      return <Alert type="error">Unknown event type dispatched</Alert>;
  }
}
