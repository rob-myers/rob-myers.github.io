// require avoids tree-shake in production
require('@public/es-react-refresh/bootstrap');
import { NextComponentType, NextPageContext } from 'next';
import { Router } from 'next/dist/client/router';
import Head from 'next/head';
import { AppInitialProps } from 'next/app';
import React, { useRef } from 'react';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import { ReduxStore } from '@store/create-store';
import withRedux from '@store/with-redux';

type RootProps = AppInitialProps & {
  Component: NextComponentType<NextPageContext, any, {}>;
  router: Router;
  reduxStore: ReduxStore;
}

const RootApp: React.FC<RootProps> = ({
  Component,
  pageProps,
  reduxStore,
}) => {
  const persistor = useRef(persistStore(reduxStore));
  return (
    <Provider store={reduxStore}>
      <PersistGate
        // loading={<Component {...pageProps} />}
        persistor={persistor.current}
      >
        <Head>
          <link rel="shortcut icon" href="/favicon.ico" />
          <style global>{`
            body {
              margin: 0px;
            }
          `}</style>
        </Head>
        <Component {...pageProps} />
      </PersistGate>
    </Provider>
  );
};

export default withRedux(RootApp as any);
