import * as React from './es-react/react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, componentStack: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ componentStack: errorInfo.componentStack })
    console.log({ error });
    console.log({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('div', { style: { padding: 10 } }, [
        React.createElement('div', { style: { background: 'white', padding: 10, overflow: 'auto' } }, [
          React.createElement('div', { style: { fontWeight: 'bold' } }, 'React threw a rendering error...'),
          React.createElement('br'),
          React.createElement('div', { style: { color: '#500', fontFamily: 'monospace' } }, this.state.error.message),
          React.createElement('plaintext', { style: { color: '#000', fontFamily: 'monospace' } }, this.state.componentStack),
        ]),
      ]);
    }

    return this.props.children; 
  }
}
