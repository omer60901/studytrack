import React from 'react';

type Props = { children: React.ReactNode };

type State = { hasError: boolean };

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.error('Uncaught error:', error, info);
    window.dispatchEvent(new CustomEvent('api-error', { detail: { message: 'An unexpected error occurred' } }));
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 m-4 bg-red-900 text-white rounded">
          <h2 className="text-xl font-bold">Something went wrong.</h2>
          <p>Please refresh the page or contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
