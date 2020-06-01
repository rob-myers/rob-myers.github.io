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
        React.createElement('div', null, 'Something went wrong.'),
        React.createElement('br'),
        React.createElement('div', null, this.state.error.message),
      ]);
    }

    return this.props.children; 
  }
}
