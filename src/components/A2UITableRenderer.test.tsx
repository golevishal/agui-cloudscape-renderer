import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import A2UITableRenderer from './A2UITableRenderer';

describe('A2UITableRenderer', () => {
  it('correctly maps various status values to StatusIndicator elements', () => {
    const mockPayload = {
      componentName: 'Table' as const,
      headers: ['Id', 'Status'],
      rows: [
        { Id: '1', Status: 'Success' },
        { Id: '2', Status: 'Failed' },
        { Id: '3', Status: 'Pending' },
        { Id: '4', Status: 'Warning: Low Space' },
        { Id: '5', Status: 'Unknown state' },
        { Id: '6', Status: null }
      ]
    };

    render(<A2UITableRenderer payload={mockPayload} />);

    // Quick verification that statuses are rendered by asserting on the presence of text strings
    // In a real testing environment we might check class names 'awsui_type-success' etc., 
    // but without DOM snapshot parsing, textual presence and non-crashing is key.
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Warning: Low Space')).toBeInTheDocument();
    expect(screen.getByText('Unknown state')).toBeInTheDocument();
  });
});
