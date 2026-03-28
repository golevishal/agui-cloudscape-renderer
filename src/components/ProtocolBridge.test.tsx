import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProtocolBridge from './ProtocolBridge';
import type { AgUiEvent } from '../types/agui';

describe('ProtocolBridge', () => {
  it('renders loading StatusIndicator when TOOL_CALL_START is received', () => {
    const events: AgUiEvent[] = [
      {
        type: 'TOOL_CALL_START',
        payload: {
          toolName: 'analyzeDatabase',
          description: 'Analyzing the database...'
        }
      }
    ];

    render(<ProtocolBridge events={events} emitEvent={vi.fn()} />);

    expect(screen.getByText('Agent is working: Analyzing the database...')).toBeInTheDocument();
  });

  it('renders info StatusIndicator when no events are present', () => {
    render(<ProtocolBridge events={[]} emitEvent={vi.fn()} />);

    expect(screen.getByText('Waiting for AG-UI events...')).toBeInTheDocument();
  });
});
