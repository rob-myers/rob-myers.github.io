import App from 'next/app';
import { Persistor, persistStore } from 'redux-persist';
import { ReduxStore } from '@store/index';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import withRedux from '@store/with-redux';
import React from 'react';

interface Props {
  reduxStore: ReduxStore;
}

class MyApp extends App<Props> {
  private persistor: Persistor;

  constructor(props: any) {
    super(props);
    this.persistor = persistStore(props.reduxStore);
  }

  public render() {
    const { Component, pageProps, reduxStore } = this.props;
    return (
      <Provider store={reduxStore}>
        <PersistGate
          loading={<Component {...pageProps} />}
          persistor={this.persistor}
        >
          <Component {...pageProps} />
        </PersistGate>
      </Provider>
    );
  }
}

export default withRedux(MyApp as any);
