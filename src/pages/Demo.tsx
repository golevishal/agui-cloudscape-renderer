import ProtocolBridge from '../components/ProtocolBridge';
import { useAgUiEvents } from '../hooks/useAgUiEvents';

export default function Demo() {
  const { events, emitEvent } = useAgUiEvents();
  
  return <ProtocolBridge events={events} emitEvent={emitEvent} />;
}
