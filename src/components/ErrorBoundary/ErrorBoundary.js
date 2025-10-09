import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({ error, errorInfo });
    // Also log to console for debugging
    console.error('Uncaught error captured by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      // You can render any custom fallback UI
      return (
        <div className="error-overlay">
          <div className="error-box">
            <h2>Something went wrong</h2>
            <pre className="error-message">{this.state.error && this.state.error.toString()}</pre>
            <pre className="error-stack">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
            <div className="error-actions">
              <button onClick={() => window.location.reload()}>Reload</button>
              <button onClick={() => {
                try {
                  navigator.clipboard && navigator.clipboard.writeText(`${this.state.error}\n\n${this.state.errorInfo && this.state.errorInfo.componentStack}`);
                  alert('Error copied to clipboard');
                } catch (e) {
                  alert('Could not copy to clipboard');
                }
              }}>Copy</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
