import { useState, useEffect, useCallback } from 'react';
import type { AgUiEvent, OutboundClientEvent } from '../types/agui';

/**
 * Mock implementation of the AG-UI event stream hook.
 *
 * This hook simulates the temporal behavior of a real agent backend:
 * 1. Emits an `ACTION_REQUIRED` event after a short delay (simulating agent reasoning)
 * 2. On `USER_RESPONSE`, simulates tool execution, state deltas, and A2UI renders
 *
 * ## Integrating with a Real Backend
 *
 * To connect this renderer to a live AG-UI event source, replace this hook
 * with one that subscribes to your backend via WebSocket, SSE, or polling:
 *
 * ```ts
 * export function useAgUiEvents(endpoint: string) {
 *   const [events, setEvents] = useState<AgUiEvent[]>([]);
 *
 *   useEffect(() => {
 *     const source = new EventSource(endpoint);
 *     source.onmessage = (msg) => {
 *       const event: AgUiEvent = JSON.parse(msg.data);
 *       setEvents(prev => [...prev, event]);
 *     };
 *     return () => source.close();
 *   }, [endpoint]);
 *
 *   const emitEvent = useCallback(async (event: OutboundClientEvent) => {
 *     await fetch(endpoint, {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(event),
 *     });
 *   }, [endpoint]);
 *
 *   return { events, emitEvent };
 * }
 * ```
 *
 * The `ProtocolBridge` component is agnostic to the event source — it only
 * requires `events: AgUiEvent[]` and `emitEvent: (e: OutboundClientEvent) => Promise<void>`.
 */
export function useAgUiEvents() {
  const [events, setEvents] = useState<AgUiEvent[]>([]);

  useEffect(() => {
    // Start with ACTION_REQUIRED
    const t0 = setTimeout(() => {
      setEvents([{
        type: 'ACTION_REQUIRED',
        payload: {
          formId: 'create-instance-form',
          title: 'Launch New EC2 Instance',
          description: 'The agent needs some details to complete the deployment.',
          fields: [
            { type: 'string', name: 'instanceName', label: 'Instance Name', required: true, defaultValue: 'ag-ui-demo', minLength: 3, maxLength: 64, pattern: '^[a-zA-Z][a-zA-Z0-9\\-]*$', constraintText: 'Letters, numbers, and hyphens. Must start with a letter.' },
            { type: 'enum', name: 'instanceType', label: 'Instance Type', options: ['t3.micro', 'm5.large', 'c5.xlarge'], defaultValue: 't3.micro', required: true },
            { type: 'boolean', name: 'enableMonitoring', label: 'Enable Detailed Monitoring', defaultValue: false, required: true, errorMessage: 'You must enable monitoring for production deployments.' }
          ]
        }
      }]);
    }, 500);

    return () => clearTimeout(t0);
  }, []);

  const emitEvent = useCallback(async (event: OutboundClientEvent) => {
    if (event.type === 'USER_RESPONSE') {
      // Simulate network delay for the form processing back to agent
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Agent is working...
      setEvents([{
        type: 'TOOL_CALL_START',
        payload: {
          toolName: 'launchEC2Instance',
          description: `Deploying instance: ${String(event.payload.data.instanceName)}...`
        }
      }]);

      setTimeout(() => {
        setEvents(prev => [...prev, {
           type: 'STATE_DELTA',
           payload: { state: 'Validating', message: 'Checking VPC configurations in target region.' }
        }]);
      }, 700);

      // Agent succeeds and returns a Catalog view with live data binding
      setTimeout(() => {
        setEvents(prev => [
          ...prev,
          {
            type: 'DATA_MODEL_UPDATE',
            payload: { deployment: { message: 'Starting instances...', pct: '10%' } }
          },
          {
            type: 'A2UI_RENDER',
            payload: {
              surface: 'tools',
              componentName: 'PropertyRedact',
              label: 'Side-channel Deployment Token',
              content: 'sec-awsx-299388-abcd'
            }
          },
          {
            type: 'A2UI_RENDER',
            payload: {
              surface: 'main',
              rootId: 'deployRoot',
              components: {
                'deployRoot': { component: 'Card', child: 'deployVStack' },
                'deployVStack': { component: 'Column', children: ['title', 'statusText', 'progressText'] },
                'title': { component: 'Text', variant: 'h2', text: 'Live Deployment Status' },
                'statusText': { component: 'Text', text: '$/deployment/message' },
                'progressText': { component: 'Text', variant: 'h1', text: '$/deployment/pct' },
              }
            }
          }
        ]);

        // Dispatch a follow-up DATA_MODEL_UPDATE
        setTimeout(() => {
          setEvents(prev => [...prev, {
            type: 'DATA_MODEL_UPDATE',
            payload: { deployment: { message: 'Configuring networking...', pct: '45%' } }
          }]);
        }, 1500);

        // Dispatch final DATA_MODEL_UPDATE
        setTimeout(() => {
          setEvents(prev => [
            ...prev,
            {
              type: 'DATA_MODEL_UPDATE',
              payload: { deployment: { message: 'Deployment complete', pct: '100%' } }
            },
            {
              type: 'TOOL_CALL_END',
              payload: { toolName: 'launchEC2Instance', resultStatus: 'success' }
            }
          ]);
        }, 3000);

      }, 1500);
    }
  }, []);

  return { events, emitEvent };
}
