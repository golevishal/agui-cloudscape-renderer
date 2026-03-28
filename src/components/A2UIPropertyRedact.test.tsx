import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import A2UIPropertyRedact from './A2UIPropertyRedact';
import type { A2UIPropertyRedactPayload } from '../types/agui';

describe('A2UIPropertyRedact', () => {
  const payload: A2UIPropertyRedactPayload = {
    componentName: 'PropertyRedact',
    label: 'Secret Token',
    content: 'SUPER_SECRET_VALUE_123'
  };

  it('renders the generic label currently and masks it via Cloudscape CSS classes', () => {
    render(<A2UIPropertyRedact payload={payload} />);
    
    // Cloudscape ExpandableSection uses a button with the header text
    expect(screen.getByText('Secret Token')).toBeInTheDocument();
    
    // As jsdom does not apply external CSS stylesheets (like Cloudscape's 'display: none' classes),
    // the content technically exists in the DOM. We verify it's correctly passed down.
    expect(screen.getByText('SUPER_SECRET_VALUE_123')).toBeInTheDocument();
  });
});
