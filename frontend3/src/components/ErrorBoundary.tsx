import React from 'react';
import toast from 'react-hot-toast';

type State = { hasError: boolean };

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() { return { hasError: true }; }

  componentDidCatch(error: any) {
    console.error(error);
    toast.error('Something went wrong. Please reload.');
  }

  render() {
    if (this.state.hasError) return <div className="card">Unexpected error occurred.</div>;
    return this.props.children;
  }
}

export default ErrorBoundary;
