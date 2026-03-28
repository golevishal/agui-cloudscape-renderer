import { useState, useEffect, useCallback } from 'react';
import type { AgUiEvent, OutboundClientEvent } from '../types/agui';

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
            { type: 'string', name: 'instanceName', label: 'Instance Name', required: true, defaultValue: 'ag-ui-demo' },
            { type: 'enum', name: 'instanceType', label: 'Instance Type', options: ['t3.micro', 'm5.large', 'c5.xlarge'], defaultValue: 't3.micro', required: true },
            { type: 'boolean', name: 'enableMonitoring', label: 'Enable Detailed Monitoring', defaultValue: false }
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

      // Agent succeeds and returns a database token redact view
      setTimeout(() => {
        setEvents(prev => [...prev, {
          type: 'A2UI_RENDER',
          payload: {
            componentName: 'PropertyRedact',
            label: 'Temporary SSH Access Key',
            content: 'ssh-rsa AAAAB3NzaC1yc... ag-ui-agent'
          }
        }]);
      }, 1500);

      // Then returns the table view
      setTimeout(() => {
        setEvents(prev => [...prev, {
          type: 'A2UI_RENDER',
          payload: {
            componentName: 'Table',
            headers: ['InstanceId', 'Type', 'Status', 'Monitoring'],
            rows: [
              { "InstanceId": "i-09999999newlycreated", "Type": String(event.payload.data.instanceType), "Monitoring": event.payload.data.enableMonitoring ? 'Enabled' : 'Disabled', "Status": "Success" }
            ]
          }
        }]);
      }, 5000);
    }
  }, []);

  return { events, emitEvent };
}
