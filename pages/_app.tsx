import App, { AppInitialProps } from 'next/app';
import { Persistor, persistStore } from 'redux-persist';
import { ReduxStore } from '@store/create-store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import withRedux from '@store/with-redux';
import React from 'react';
import { NextComponentType, NextPageContext } from 'next';
import { Router } from 'next/dist/client/router';
import Head from 'next/head';

interface Props {
  reduxStore: ReduxStore;
}

class MyApp extends App<Props> {
  private persistor: Persistor;

  constructor(
    props: Props & AppInitialProps & {
      Component: NextComponentType<NextPageContext, any, {}>;
      router: Router;
    }
  ) {
    super(props);
    this.persistor = persistStore(props.reduxStore);
  }

  public render() {
    const { Component, pageProps, reduxStore } = this.props;
    return (
      <Provider store={reduxStore}>
        <PersistGate
          // loading={<Component {...pageProps} />}
          persistor={this.persistor}
        >
          <Head>
            <link rel="shortcut icon" href="/favicon.ico" />
          </Head>
          <Component {...pageProps} />
        </PersistGate>
      </Provider>
    );
  }
}

export default withRedux(MyApp as any);
