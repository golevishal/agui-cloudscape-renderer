import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SurfaceRenderer from './SurfaceRenderer';
import type { ActionRequiredEvent } from '../types/agui';

const mockPayload: ActionRequiredEvent['payload'] = {
  formId: 'test-form',
  title: 'Test Form',
  description: 'Please fill out these fields',
  fields: [
    { type: 'string', name: 'firstName', label: 'First Name', required: true, defaultValue: 'AWS User' },
    { type: 'boolean', name: 'acceptTerms', label: 'Accept Terms', defaultValue: true },
    { type: 'enum', name: 'role', label: 'Role', options: ['Admin', 'Developer'], defaultValue: 'Developer', required: true },
  ]
};

describe('SurfaceRenderer', () => {
  it('renders correctly mapping fields to inputs', () => {
    render(<SurfaceRenderer payload={mockPayload} onSubmit={vi.fn()} />);

    expect(screen.getByText('Test Form')).toBeInTheDocument();
    expect(screen.getByText('Please fill out these fields')).toBeInTheDocument();
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Accept Terms')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
  });

  it('submits the form and includes the default values correctly', async () => {
    const mockSubmit = vi.fn().mockResolvedValue(true);
    render(<SurfaceRenderer payload={mockPayload} onSubmit={mockSubmit} />);

    // In a real browser or Cloudscape test layout, we click the submit button.
    // Cloudscape <Button formAction="submit"> will trigger the internal <form> onSubmit.
    fireEvent.click(screen.getByText('Submit'));

    expect(mockSubmit).toHaveBeenCalledWith({
      type: 'USER_RESPONSE',
      payload: {
        formId: 'test-form',
        data: {
          firstName: 'AWS User',
          acceptTerms: true,
          role: 'Developer'
        }
      }
    });
  });
});
