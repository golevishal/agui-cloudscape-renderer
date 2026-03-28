import { Component, type ReactNode } from 'react';
import Alert from '@cloudscape-design/components/alert';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert type="error" header="Something went wrong">
          {this.state.error?.message || 'Unknown error occurred'}
        </Alert>
      );
    }

    return this.props.children;
  }
}
