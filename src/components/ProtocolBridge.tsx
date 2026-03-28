import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Alert from '@cloudscape-design/components/alert';
import A2UITableRenderer from './A2UITableRenderer';
import SurfaceRenderer from './SurfaceRenderer';
import A2UIPropertyRedact from './A2UIPropertyRedact';
import A2UIRenderer from './A2UIRenderer';
import type { AgUiEvent, OutboundClientEvent, A2UITablePayload, A2UIPropertyRedactPayload, A2UICatalogPayload } from '../types/agui';

interface ProtocolBridgeProps {
  events: AgUiEvent[];
  emitEvent: (event: OutboundClientEvent) => Promise<void>;
}

export default function ProtocolBridge({ events, emitEvent }: ProtocolBridgeProps) {
  if (events.length === 0) {
    return <StatusIndicator type="info">Waiting for AG-UI events...</StatusIndicator>;
  }

  const currentEvent = events[events.length - 1];

  switch (currentEvent.type) {
    case 'ACTION_REQUIRED':
      return <SurfaceRenderer payload={currentEvent.payload} onSubmit={emitEvent} />;
    case 'TOOL_CALL_START':
      return (
        <StatusIndicator type="loading">
          Agent is working: {currentEvent.payload.description || currentEvent.payload.toolName}
        </StatusIndicator>
      );
    case 'STATE_DELTA':
      return (
        <Alert type="info" header={currentEvent.payload.state}>
          {currentEvent.payload.message}
        </Alert>
      );
    case 'A2UI_RENDER':
      if ('rootId' in currentEvent.payload) {
        const catalogPayload = currentEvent.payload as A2UICatalogPayload;
        return <A2UIRenderer rootId={catalogPayload.rootId} components={catalogPayload.components} />;
      } else if ('componentName' in currentEvent.payload && currentEvent.payload.componentName === 'Table') {
        return <A2UITableRenderer payload={currentEvent.payload as A2UITablePayload} />;
      } else if ('componentName' in currentEvent.payload && currentEvent.payload.componentName === 'PropertyRedact') {
        return <A2UIPropertyRedact payload={currentEvent.payload as A2UIPropertyRedactPayload} />;
      }
      return <Alert type="error">Unknown render payload</Alert>;
    default:
      return <Alert type="error">Unknown event type dispatched</Alert>;
  }
}
