import React from 'react';
import {
  Box, Icon, SpaceBetween, Container, Tabs, Button, Input, Checkbox, Select, DatePicker, Modal as CloudscapeModal
} from '@cloudscape-design/components';
import type { AnyCatalogComponent } from '../types/agui';

interface A2UIRendererProps {
  rootId: string;
  components: Record<string, AnyCatalogComponent>;
}

export default function A2UIRenderer({ rootId, components }: A2UIRendererProps) {
  const renderComponent = (id: string): React.ReactNode => {
    const component = components[id];
    if (!component) return <div key={id} style={{ color: 'red' }}>[Missing ID: {id}]</div>;

    switch (component.component) {
      case 'Text': {
        let boxVariant: "h1" | "h2" | "h3" | "h4" | "h5" | "p" | "small" = 'p';
        if (component.variant === 'caption') boxVariant = 'small';
        else if (component.variant && component.variant !== 'body') boxVariant = component.variant;
        return <Box key={id} variant={boxVariant}>{component.text}</Box>;
      }
      case 'Image':
        return <img key={id} src={component.url} alt={component.description} style={{ maxWidth: '100%', objectFit: (component.fit === 'scaleDown' ? 'scale-down' : component.fit) || 'fill' }} />;
        
      case 'Icon':
        return <Icon key={id} name={typeof component.name === 'string' ? component.name as React.ComponentProps<typeof Icon>['name'] : 'star'} />;
        
      case 'Row':
        return (
          <SpaceBetween key={id} direction="horizontal" size="m">
            {component.children.map(childId => <div key={childId}>{renderComponent(childId)}</div>)}
          </SpaceBetween>
        );
        
      case 'Column':
      case 'List':
        return (
          <SpaceBetween key={id} direction="vertical" size="m">
            {component.children.map(childId => <div key={childId}>{renderComponent(childId)}</div>)}
          </SpaceBetween>
        );
        
      case 'Card':
        return <Container key={id}>{renderComponent(component.child)}</Container>;
        
      case 'Tabs':
        return (
          <Tabs
            key={id}
            tabs={component.tabs.map((tab, idx) => ({
              id: `${id}-tab-${idx}`,
              label: tab.title,
              content: renderComponent(tab.child)
            }))}
          />
        );
        
      case 'Modal':
        return <ModalWrapper key={id} trigger={renderComponent(component.trigger)} content={renderComponent(component.content)} />;
        
      case 'Divider':
        return <hr key={id} style={{ border: 'none', borderTop: '1px solid var(--color-border-divider-default)', margin: '16px 0' }} />;
        
      case 'Button':
        return (
          <Button key={id} variant={component.variant === 'primary' ? 'primary' : 'normal'}>
            {renderComponent(component.child)}
          </Button>
        );
        
      case 'TextField':
        return <Input key={id} value={component.value || ''} onChange={() => {}} placeholder={component.label} />;
        
      case 'CheckBox':
        return <Checkbox key={id} checked={component.value} onChange={() => {}}>{component.label}</Checkbox>;
        
      case 'ChoicePicker':
        return (
          <Select
            key={id}
            selectedOption={component.value?.[0] ? { label: component.value[0], value: component.value[0] } : null}
            onChange={() => {}}
            options={component.options.map(opt => ({ label: opt.label, value: opt.value }))}
            placeholder={component.label}
          />
        );
        
      case 'DateTimeInput':
        return <DatePicker key={id} value={component.value} onChange={() => {}} placeholder="YYYY/MM/DD" />;
        
      default:
        return <div key={id}>Unsupported Component</div>;
    }
  };

  return <>{renderComponent(rootId)}</>;
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
