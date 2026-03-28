import { useState } from 'react';
import {
  Container,
  Form,
  SpaceBetween,
  FormField,
  Input,
  Checkbox,
  Select,
  Button,
  Header
} from '@cloudscape-design/components';
import type { ActionRequiredEvent, OutboundClientEvent, FieldDefinition } from '../types/agui';

interface SurfaceRendererProps {
  payload: ActionRequiredEvent['payload'];
  onSubmit: (event: OutboundClientEvent) => Promise<void>;
}

export default function SurfaceRenderer({ payload, onSubmit }: SurfaceRendererProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const defaultData: Record<string, unknown> = {};
    for (const field of payload.fields) {
      if (field.defaultValue !== undefined) {
        defaultData[field.name] = field.defaultValue;
      } else if (field.type === 'string' || field.type === 'enum') {
         defaultData[field.name] = '';
      } else {
         defaultData[field.name] = false;
      }
    }
    return defaultData;
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        type: 'USER_RESPONSE',
        payload: {
          formId: payload.formId,
          data: formData
        }
      });
    } finally {
      setIsSubmitting(false); // Modal likely unmounts before this runs anyway based on event clear
    }
  };

  const renderField = (field: FieldDefinition) => {
    switch (field.type) {
      case 'string':
        return (
          <Input
            value={(formData[field.name] as string) || ''}
            onChange={({ detail }) => setFormData({ ...formData, [field.name]: detail.value })}
            disabled={isSubmitting}
          />
        );
      case 'boolean':
        return (
          <Checkbox
            checked={!!formData[field.name]}
            onChange={({ detail }) => setFormData({ ...formData, [field.name]: detail.checked })}
            disabled={isSubmitting}
          >
            {field.label}
          </Checkbox>
        );
      case 'enum':
        return (
          <Select
            selectedOption={{ label: formData[field.name] as string, value: formData[field.name] as string }}
            onChange={({ detail }) => setFormData({ ...formData, [field.name]: detail.selectedOption.value })}
            options={field.options.map(opt => ({ label: opt, value: opt }))}
            disabled={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container
      header={payload.title ? <Header variant="h2">{payload.title}</Header> : undefined}
    >
      <form onSubmit={handleSubmit}>
        <Form
          actions={
            <Button variant="primary" formAction="submit" loading={isSubmitting}>
              Submit
            </Button>
          }
        >
          <SpaceBetween direction="vertical" size="l">
            {payload.description && <div>{payload.description}</div>}
            
            {payload.fields.map(field => (
              <FormField 
                key={field.name} 
                label={field.type !== 'boolean' ? field.label : undefined}
              >
                {renderField(field)}
              </FormField>
            ))}
          </SpaceBetween>
        </Form>
      </form>
    </Container>
  );
}
