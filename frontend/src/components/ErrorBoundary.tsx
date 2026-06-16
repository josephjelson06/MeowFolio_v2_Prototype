import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleClearSiteData = () => {
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
      document.cookie = name.trim() + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
    
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '24px',
          maxWidth: '600px',
          margin: '40px auto',
          fontFamily: 'system-ui, sans-serif',
          background: '#fff',
          borderRadius: '8px',
          border: '1px solid #ffccd5',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ color: '#d9383a', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Something went wrong</h1>
          <p style={{ color: '#555', fontSize: '14px', marginBottom: '20px' }}>
            MeowFolio encountered an unexpected crash. You can reload or clear site data to recover.
          </p>
          <div style={{
            background: '#f8f9fa',
            padding: '16px',
            borderRadius: '6px',
            overflowX: 'auto',
            fontSize: '13px',
            color: '#333',
            fontFamily: 'monospace',
            marginBottom: '20px',
            border: '1px solid #e9ecef',
            whiteSpace: 'pre-wrap'
          }}>
            <strong>Error:</strong> {this.state.error?.toString()}
            {this.state.errorInfo?.componentStack && (
              <>
                <br /><br />
                <strong>Stack Trace:</strong>
                <pre style={{ margin: '8px 0 0 0', fontSize: '11px', lineHeight: '1.4' }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#1c1c18',
                color: '#fff',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
            <button
              onClick={this.handleClearSiteData}
              style={{
                background: '#d9383a',
                color: '#fff',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Clear Site Data & Log Out
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
