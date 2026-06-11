import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Log to external service in production
    if (import.meta.env.PROD) {
      // Add your error tracking service here (e.g., Sentry, LogRocket)
      // logErrorToService(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "2rem",
          textAlign: "center",
          backgroundColor: "#f7f7f7",
        }}>
          <h1 style={{ color: "#e53e3e", marginBottom: "1rem" }}>
            Oops! Something went wrong
          </h1>
          <p style={{ color: "#4a5568", marginBottom: "1.5rem" }}>
            We're sorry for the inconvenience. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#3182ce",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Refresh Page
          </button>
          {import.meta.env.DEV && this.state.error && (
            <details style={{ marginTop: "2rem", textAlign: "left", maxWidth: "600px" }}>
              <summary style={{ cursor: "pointer", color: "#e53e3e" }}>
                Error Details (Dev Only)
              </summary>
              <pre style={{
                backgroundColor: "#2d3748",
                color: "#f7fafc",
                padding: "1rem",
                borderRadius: "0.375rem",
                overflow: "auto",
                fontSize: "0.875rem",
                marginTop: "0.5rem",
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
