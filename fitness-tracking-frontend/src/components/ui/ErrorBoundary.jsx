import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught', error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-lg shadow-sm p-6 text-center">
            <h1 className="text-xl font-semibold text-red-700">Something went wrong</h1>
            <p className="mt-2 text-sm text-gray-600 break-words">{this.state.error.message}</p>
            <button
              type="button"
              onClick={this.handleReset}
              className="mt-4 inline-flex h-10 px-4 items-center rounded-md bg-primary text-white text-sm hover:bg-primary-dark"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
