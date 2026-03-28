import React from 'react';
import {
  Box, Icon, SpaceBetween, Container, Tabs, Button, Input, Checkbox, Select, DatePicker, Modal as CloudscapeModal
} from '@cloudscape-design/components';
import { useA2UIStateProperty } from '../hooks/useA2UIState';
import type { AnyCatalogComponent } from '../types/agui';

interface A2UIRendererProps {
  rootId: string;
  components: Record<string, AnyCatalogComponent>;
}

export default function A2UIRenderer({ rootId, components }: A2UIRendererProps) {
  return <ComponentRenderer id={rootId} components={components} />;
}

function ComponentRenderer({ id, components }: { id: string; components: Record<string, AnyCatalogComponent> }) {
  const component = components[id];
  
  // Conditionally hook calls are illegal, so we unconditionally bind the common properties
  // that support data-binding. Components that don't have these properties simply pass undefined.
  const text = useA2UIStateProperty((component as any)?.text);
  const value = useA2UIStateProperty((component as any)?.value);
  const label = useA2UIStateProperty((component as any)?.label);
  const url = useA2UIStateProperty((component as any)?.url);
  const description = useA2UIStateProperty((component as any)?.description);

  if (!component) return <div style={{ color: 'red' }}>[Missing ID: {id}]</div>;
    if (!component) return <div key={id} style={{ color: 'red' }}>[Missing ID: {id}]</div>;

    switch (component.component) {
      case 'Text': {
        let boxVariant: "h1" | "h2" | "h3" | "h4" | "h5" | "p" | "small" = 'p';
        if (component.variant === 'caption') boxVariant = 'small';
        else if (component.variant && component.variant !== 'body') boxVariant = component.variant;
        return <Box variant={boxVariant}>{text as string}</Box>;
      }
      case 'Image':
        return <img src={url as string} alt={description as string} style={{ maxWidth: '100%', objectFit: (component.fit === 'scaleDown' ? 'scale-down' : component.fit) || 'fill' }} />;
        
      case 'Icon':
        return <Icon name={typeof component.name === 'string' ? component.name as React.ComponentProps<typeof Icon>['name'] : 'star'} />;
        
      case 'Row':
        return (
          <SpaceBetween direction="horizontal" size="m">
            {component.children.map(childId => <ComponentRenderer key={childId} id={childId} components={components} />)}
          </SpaceBetween>
        );
        
      case 'Column':
      case 'List':
        return (
          <SpaceBetween direction="vertical" size="m">
            {component.children.map(childId => <ComponentRenderer key={childId} id={childId} components={components} />)}
          </SpaceBetween>
        );
        
      case 'Card':
        return <Container><ComponentRenderer id={component.child} components={components} /></Container>;
        
      case 'Tabs':
        return (
          <Tabs
            tabs={component.tabs.map((tab, idx) => ({
              id: `${id}-tab-${idx}`,
              label: tab.title,
              content: <ComponentRenderer id={tab.child} components={components} />
            }))}
          />
        );
        
      case 'Modal':
        return <ModalWrapper trigger={<ComponentRenderer id={component.trigger} components={components} />} content={<ComponentRenderer id={component.content} components={components} />} />;
        
      case 'Divider':
        return <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-divider-default)', margin: '16px 0' }} />;
        
      case 'Button':
        return (
          <Button variant={component.variant === 'primary' ? 'primary' : 'normal'}>
            <ComponentRenderer id={component.child} components={components} />
          </Button>
        );
        
      case 'TextField':
        return <Input value={(value as string) || ''} onChange={() => {}} placeholder={label as string} />;
        
      case 'CheckBox':
        return <Checkbox checked={!!value} onChange={() => {}}>{label as React.ReactNode}</Checkbox>;
        
      case 'ChoicePicker': {
        const selectedValues = Array.isArray(value) ? value : [value];
        return (
          <Select
            selectedOption={selectedValues[0] ? { label: selectedValues[0] as string, value: selectedValues[0] as string } : null}
            onChange={() => {}}
            options={component.options.map(opt => ({ label: opt.label, value: opt.value }))}
            placeholder={label as string}
          />
        );
      }
        
      case 'DateTimeInput':
        return <DatePicker value={value as string} onChange={() => {}} placeholder="YYYY/MM/DD" />;
        
      default:
        return <div>Unsupported Component</div>;
    }
}

function ModalWrapper({ trigger, content }: { trigger: React.ReactNode; content: React.ReactNode }) {
  const [visible, setVisible] = React.useState(false);
  return (
    <>
      <div onClick={() => setVisible(true)} style={{ display: 'inline-block' }}>{trigger}</div>
      <CloudscapeModal visible={visible} onDismiss={() => setVisible(false)} size="medium">
        {content}
      </CloudscapeModal>
    </>
  );
}
