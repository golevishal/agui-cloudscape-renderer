import { useState, useCallback } from 'react';
import {
  Container,
  Form,
  SpaceBetween,
  FormField,
  Input,
  Checkbox,
  Select,
  Button,
  Header,
  Alert,
  Box
} from '@cloudscape-design/components';
import type { ActionRequiredEvent, OutboundClientEvent, FieldDefinition } from '../types/agui';

interface SurfaceRendererProps {
  payload: ActionRequiredEvent['payload'];
  onSubmit: (event: OutboundClientEvent) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Validation engine
// ---------------------------------------------------------------------------

/** Per-field error string, or empty string if valid. */
function validateField(field: FieldDefinition, value: unknown): string {
  const custom = field.errorMessage; // user-supplied override

  switch (field.type) {
    case 'string': {
      const str = (value as string) ?? '';

      if (field.required && str.trim().length === 0) {
        return custom ?? `${field.label} is required.`;
      }
      if (field.minLength != null && str.length < field.minLength) {
        return custom ?? `${field.label} must be at least ${field.minLength} characters.`;
      }
      if (field.maxLength != null && str.length > field.maxLength) {
        return custom ?? `${field.label} must be at most ${field.maxLength} characters.`;
      }
      if (field.pattern) {
        try {
          const re = new RegExp(field.pattern);
          if (!re.test(str)) {
            return custom ?? `${field.label} does not match the required format.`;
          }
        } catch {
          // If the supplied pattern is invalid regex, skip the check silently
        }
      }
      return '';
    }

    case 'boolean': {
      if (field.required && !value) {
        return custom ?? `${field.label} must be acknowledged.`;
      }
      return '';
    }

    case 'enum': {
      if (field.required && (!value || (value as string).trim().length === 0)) {
        return custom ?? `${field.label} is required.`;
      }
      return '';
    }

    default:
      return '';
  }
}

/** Run all validations. Returns map of fieldName → error. Empty map = valid. */
function validateAll(
  fields: FieldDefinition[],
  data: Record<string, unknown>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const err = validateField(field, data[field.name]);
    if (err) errors[field.name] = err;
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  // Live-clear a single field error when the user starts fixing it
  const updateField = useCallback((name: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    // Also clear form-level error since user is actively editing
    setFormError('');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const errors = validateAll(payload.fields, formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError(`Please fix ${Object.keys(errors).length} error${Object.keys(errors).length > 1 ? 's' : ''} before submitting.`);
      return;
    }

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
      setIsSubmitting(false);
    }
  };

  // Build constraint text for a field from its validation rules
  const getConstraintText = (field: FieldDefinition): string | undefined => {
    if (field.constraintText) return field.constraintText;

    const parts: string[] = [];
    if (field.type === 'string') {
      if (field.minLength != null && field.maxLength != null) {
        parts.push(`${field.minLength}–${field.maxLength} characters`);
      } else if (field.minLength != null) {
        parts.push(`At least ${field.minLength} characters`);
      } else if (field.maxLength != null) {
        parts.push(`At most ${field.maxLength} characters`);
      }
      if (field.pattern) {
        parts.push(`Format: ${field.pattern}`);
      }
    }
    if ('required' in field && field.required) {
      parts.push('Required');
    }
    return parts.length > 0 ? parts.join(' · ') : undefined;
  };

  const renderField = (field: FieldDefinition) => {
    switch (field.type) {
      case 'string':
        return (
          <Input
            value={(formData[field.name] as string) || ''}
            onChange={({ detail }) => updateField(field.name, detail.value)}
            disabled={isSubmitting}
            invalid={!!fieldErrors[field.name]}
          />
        );
      case 'boolean':
        return (
          <Checkbox
            checked={!!formData[field.name]}
            onChange={({ detail }) => updateField(field.name, detail.checked)}
            disabled={isSubmitting}
          >
            {field.label}
          </Checkbox>
        );
      case 'enum':
        return (
          <Select
            selectedOption={
              formData[field.name]
                ? { label: formData[field.name] as string, value: formData[field.name] as string }
                : null
            }
            onChange={({ detail }) => updateField(field.name, detail.selectedOption.value)}
            options={field.options.map(opt => ({ label: opt, value: opt }))}
            disabled={isSubmitting}
            invalid={!!fieldErrors[field.name]}
            placeholder={`Select ${field.label.toLowerCase()}`}
          />
        );
      default:
        return null;
    }
  };

  const errorCount = Object.keys(fieldErrors).length;

  return (
    <Container
      header={payload.title ? <Header variant="h2">{payload.title}</Header> : undefined}
    >
      <form onSubmit={handleSubmit}>
        <Form
          errorText={formError}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Box>
                {errorCount > 0 && (
                  <Box variant="small" color="text-status-error">
                    {errorCount} field{errorCount > 1 ? 's' : ''} need{errorCount === 1 ? 's' : ''} attention
                  </Box>
                )}
              </Box>
              <Button variant="primary" formAction="submit" loading={isSubmitting}>
                Submit
              </Button>
            </SpaceBetween>
          }
        >
          <SpaceBetween direction="vertical" size="l">
            {payload.description && <div>{payload.description}</div>}

            {formError && (
              <Alert type="error" dismissible onDismiss={() => setFormError('')}>
                {formError}
              </Alert>
            )}

            {payload.fields.map(field => (
              <FormField
                key={field.name}
                label={field.type !== 'boolean' ? field.label : undefined}
                errorText={fieldErrors[field.name] || undefined}
                constraintText={getConstraintText(field)}
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
