import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log error info here if needed
    // console.error(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, textAlign: 'center', color: '#d32f2f' }}>
          <h2>Bir hata oluştu.</h2>
          <pre style={{ color: '#b71c1c', background: '#fff0f0', padding: 16, borderRadius: 8, overflowX: 'auto' }}>{this.state.error?.message}</pre>
          <button onClick={this.handleRetry} style={{ marginTop: 16, padding: '8px 24px', borderRadius: 4, background: '#1976d2', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Tekrar Dene</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 