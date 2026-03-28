import { useState, useMemo } from 'react';
import { HelpPanel, ExpandableSection, Box, StatusIndicator, Modal, Button } from '@cloudscape-design/components';
import type { AgUiEvent } from '../types/agui';

interface TraceSidebarProps {
  events: AgUiEvent[];
}

interface ActivityBlock {
  id: number;
  type: 'TOOL' | 'STANDALONE';
  toolName?: string;
  description?: string;
  status?: 'running' | 'success' | 'error';
  event?: AgUiEvent; // If STANDALONE
  children?: AgUiEvent[]; // If TOOL
}

export default function TraceSidebar({ events }: TraceSidebarProps) {
  const activities = useMemo(() => {
    const list: ActivityBlock[] = [];
    let currentActivity: ActivityBlock | null = null;

    for (const event of events) {
      if (event.type === 'TOOL_CALL_START') {
        currentActivity = { 
          id: list.length, 
          type: 'TOOL',
          toolName: event.payload.toolName, 
          description: event.payload.description, 
          status: 'running', 
          children: [] 
        };
        list.push(currentActivity);
      } else if (event.type === 'TOOL_CALL_END') {
        if (currentActivity) {
          currentActivity.status = event.payload.resultStatus;
          currentActivity = null;
        } else {
          list.push({ id: list.length, type: 'STANDALONE', event });
        }
      } else {
        if (currentActivity) {
          currentActivity.children!.push(event);
        } else {
          // If we receive events before a tool starts or outside a tool loop, track them.
          list.push({ id: list.length, type: 'STANDALONE', event });
        }
      }
    }
    return list;
  }, [events]);

  const [selectedEvent, setSelectedEvent] = useState<AgUiEvent | null>(null);

  const formatPayload = (payload: unknown) => {
    try {
      return JSON.stringify(payload, null, 2);
    } catch {
      return 'Invalid payload';
    }
  };

  const renderEventPill = (e: AgUiEvent, idx: number) => {
    let title: string = e.type;
    let color = 'var(--color-text-body-default)';
    
    if (e.type === 'STATE_DELTA') { title = `STATE: ${e.payload.state}`; color = 'var(--color-text-status-info)'; }
    if (e.type === 'DATA_MODEL_UPDATE') { title = 'DATA UPDATED'; color = 'var(--color-text-status-success)'; }
    if (e.type === 'A2UI_RENDER') { 
      const compLabel = 'rootId' in e.payload ? 'Catalog' : e.payload.componentName;
      title = `RENDER: ${compLabel}`; 
      color = 'var(--color-text-status-warning)'; 
    }
    if (e.type === 'ACTION_REQUIRED') { title = 'ACTION REQUIRED'; color = 'var(--color-text-status-error)'; }

    return (
      <Box margin={{ bottom: 'xs' }} key={`ev-${idx}`}>
        <div 
          onClick={() => setSelectedEvent(e)}
          style={{
            cursor: 'pointer',
            padding: '4px 8px',
            borderLeft: `4px solid ${color}`,
            backgroundColor: 'var(--color-background-container-content)',
            boxShadow: '0 1px 1px 0 rgba(0, 28, 36, 0.1)',
            borderRadius: '2px',
            fontSize: '12px'
          }}
        >
          {title}
        </div>
      </Box>
    );
  };

  return (
    <>
      <HelpPanel header={<h2 style={{ margin: 0 }}>Agent Trace</h2>}>
        {activities.map(act => {
          if (act.type === 'STANDALONE') {
            return (
              <Box key={`standalone-${act.id}`} margin={{ bottom: 'm' }}>
                {renderEventPill(act.event!, act.id)}
              </Box>
            );
          }

          let type: 'info' | 'success' | 'warning' | 'error' | 'loading' = 'loading';
          if (act.status === 'success') type = 'success';
          if (act.status === 'error') type = 'error';

          return (
            <Box key={`tool-${act.id}`} margin={{ bottom: 'l' }}>
              <ExpandableSection
                headerText={
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <StatusIndicator type={type}>{act.toolName}</StatusIndicator>
                  </span>
                }
                defaultExpanded
              >
                {act.description && (
                  <Box variant="small" margin={{ bottom: 's' }} color="text-body-secondary">
                    {act.description}
                  </Box>
                )}
                {act.children!.map((e, idx) => renderEventPill(e, idx))}
              </ExpandableSection>
            </Box>
          );
        })}
      </HelpPanel>

      <Modal
        visible={!!selectedEvent}
        onDismiss={() => setSelectedEvent(null)}
        header={`Raw Payload: ${selectedEvent?.type}`}
        size="large"
        footer={
          <Box float="right">
            <Button variant="primary" onClick={() => setSelectedEvent(null)}>Close</Button>
          </Box>
        }
      >
        <div style={{ padding: '16px', backgroundColor: '#16191f', color: '#f2f3f3', borderRadius: '4px', overflowX: 'auto' }}>
          <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '13px' }}>
            {selectedEvent ? formatPayload(selectedEvent.payload) : ''}
          </pre>
        </div>
      </Modal>
    </>
  );
}
