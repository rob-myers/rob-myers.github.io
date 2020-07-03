import * as React from './es-react/react.js';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
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
        ]),
      ]);
    }

    return this.props.children; 
  }
}
