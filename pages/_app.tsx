import { NextComponentType, NextPageContext } from 'next';
import { Router } from 'next/dist/client/router';
import Head from 'next/head';
import { AppInitialProps } from 'next/app';
import React, { useRef, useEffect } from 'react';
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

  useEffect(() => {
    const hiddenAppsEl = document.body.appendChild(document.createElement('div'));
    hiddenAppsEl.id = 'hidden-apps-container';
    hiddenAppsEl.style.setProperty('display', 'none');
    return () => void hiddenAppsEl.remove();
  }, []);

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
