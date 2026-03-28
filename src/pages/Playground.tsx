import { useState, useMemo, useCallback } from 'react';
import { ColumnLayout, Textarea, Select, Alert, Container, Header } from '@cloudscape-design/components';
import ProtocolBridge from '../components/ProtocolBridge';
import type { AgUiEvent, AnyCatalogComponent, OutboundClientEvent } from '../types/agui';

const generatePayload = (rootId: string, components: Record<string, AnyCatalogComponent>) => ({
  type: 'A2UI_RENDER',
  payload: { rootId, components }
});

const TEMPLATES: Record<string, unknown> = {
  // Legacy / Advanced Mappings
  table: {
    type: 'A2UI_RENDER',
    payload: {
      componentName: 'Table',
      headers: ['InstanceId', 'Type', 'Status'],
      rows: [
        { InstanceId: 'i-demo123', Type: 't3.micro', Status: 'Success' },
        { InstanceId: 'i-demo456', Type: 'm5.large', Status: 'Failed' }
      ]
    }
  },
  form: {
    type: 'ACTION_REQUIRED',
    payload: {
      formId: 'dev-form',
      title: 'Developer Test Form',
      description: 'A mock HITL form with validation rules. Try submitting with an empty field.',
      fields: [
        { type: 'string', name: 'demoParam', label: 'Parameter', required: true, minLength: 2, maxLength: 128, pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$', constraintText: 'Identifier format: letters, digits, underscores.' },
        { type: 'enum', name: 'region', label: 'Region', options: ['us-east-1', 'eu-west-1', 'ap-southeast-1'], required: true },
        { type: 'boolean', name: 'confirm', label: 'I confirm this action is intentional', required: true, errorMessage: 'You must confirm before proceeding.' }
      ]
    }
  },
  trace: {
    type: 'A2UI_RENDER',
    payload: {
      componentName: 'PropertyRedact',
      label: 'API Key',
      content: 'sk-live-fake-token-do-not-share'
    }
  },
  multisurface: [
    generatePayload('c1', { c1: { component: 'Text', text: 'This rendering engine navigates Cloudscape layouts directly from the protocol event arrays!', variant: 'body' } }),
    {
      type: 'A2UI_RENDER',
      payload: {
        surface: 'tools',
        componentName: 'PropertyRedact',
        label: 'Side-panel UI Widget',
        content: 'I am rendering securely in the Cloudscape tools panel!'
      }
    }
  ],

  // Individually Isolated Catalog Primitives
  text: generatePayload('c1', { c1: { component: 'Text', text: 'Hello Cloudscape', variant: 'h2' } }),
  image: generatePayload('img1', { img1: { component: 'Image', url: 'https://placehold.co/400x200', description: 'Placeholder', fit: 'cover' } }),
  icon: generatePayload('ico1', { ico1: { component: 'Icon', name: 'star' } }),
  row: generatePayload('r1', {
    r1: { component: 'Row', children: ['t1', 't2', 't3'] },
    t1: { component: 'Text', text: 'Left' },
    t2: { component: 'Text', text: 'Center' },
    t3: { component: 'Text', text: 'Right' }
  }),
  column: generatePayload('c1', {
    c1: { component: 'Column', children: ['t1', 't2'] },
    t1: { component: 'Text', text: 'Top Item' },
    t2: { component: 'Text', text: 'Bottom Item' }
  }),
  list: generatePayload('l1', {
    l1: { component: 'List', children: ['li1', 'li2'] },
    li1: { component: 'Text', text: 'Bulleted point 1' },
    li2: { component: 'Text', text: 'Bulleted point 2' }
  }),
  card: generatePayload('card1', {
    card1: { component: 'Card', child: 'txt1' },
    txt1: { component: 'Text', text: 'This text is housed inside a native layout Card.' }
  }),
  tabs: generatePayload('tabs1', {
    tabs1: { component: 'Tabs', tabs: [{ title: 'Tab 1', child: 't1' }, { title: 'Tab 2', child: 't2' }] },
    t1: { component: 'Text', text: 'Content specifically for Tab 1' },
    t2: { component: 'Text', text: 'Content specifically for Tab 2' }
  }),
  modal: generatePayload('modal1', {
    modal1: { component: 'Modal', trigger: 'btn1', content: 'txt1' },
    btn1: { component: 'Button', child: 'btxt', variant: 'primary' },
    btxt: { component: 'Text', text: 'Open Target Modal' },
    txt1: { component: 'Text', text: 'Internal projected modal payload output.' }
  }),
  divider: generatePayload('div1', { div1: { component: 'Divider', axis: 'horizontal' } }),
  button: generatePayload('btn1', {
    btn1: { component: 'Button', child: 'txt1', variant: 'default' },
    txt1: { component: 'Text', text: 'Engage Action' }
  }),
  textfield: generatePayload('tf1', { tf1: { component: 'TextField', label: 'Target ID', value: '' } }),
  checkbox: generatePayload('chk1', { chk1: { component: 'CheckBox', label: 'Acknowledge Deletion', value: true } }),
  choicepicker: generatePayload('cp1', {
    cp1: { component: 'ChoicePicker', label: 'Select Region', options: [{ label: 'us-east-1', value: 'ue1' }, { label: 'eu-west-1', value: 'ew1' }], value: ['ue1'] }
  }),
  datetimeinput: generatePayload('dt1', { dt1: { component: 'DateTimeInput', value: '2026-03-28' } })
};

const TEMPLATE_OPTIONS = Object.keys(TEMPLATES).map(key => ({
  label: key.toUpperCase(),
  value: key
}));

export default function Playground() {
  const [selectedTemplate, setSelectedTemplate] = useState('text');
  const [jsonInput, setJsonInput] = useState(() => JSON.stringify(TEMPLATES.text, null, 2));

  const handleTemplateChange = (val: string) => {
    setSelectedTemplate(val);
    setJsonInput(JSON.stringify(TEMPLATES[val], null, 2));
  };

  const parsedEvents = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      return Array.isArray(parsed) ? parsed as AgUiEvent[] : [parsed as AgUiEvent];
    } catch {
      return null;
    }
  }, [jsonInput]);

  const mockEmitEvent = useCallback(async (e: OutboundClientEvent) => {
    console.log('Mock emitted event:', e);
  }, []);

  return (
    <Container header={<Header variant="h2">Interactive Protocol Playground</Header>}>
      <ColumnLayout columns={2}>
        <div>
          <Select
            selectedOption={{ label: selectedTemplate.toUpperCase(), value: selectedTemplate }}
            onChange={({ detail }) => handleTemplateChange(detail.selectedOption.value as string)}
            options={TEMPLATE_OPTIONS}
          />
          <div style={{ marginTop: 16 }}>
            <Textarea
              value={jsonInput}
              onChange={({ detail }) => setJsonInput(detail.value)}
              rows={30}
            />
          </div>
        </div>
        
        <div>
          {parsedEvents ? (
            <ProtocolBridge 
              events={parsedEvents} 
              emitEvent={mockEmitEvent} 
            />
          ) : (
            <Alert type="error" header="Invalid JSON">
              Please fix the JSON syntax to see the preview.
            </Alert>
          )}
        </div>
      </ColumnLayout>
    </Container>
  );
}
