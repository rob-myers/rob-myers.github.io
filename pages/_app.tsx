import { NextComponentType, NextPageContext } from 'next';
import { Router } from 'next/dist/client/router';
import Head from 'next/head';
import { AppInitialProps } from 'next/app';
import { Provider } from 'react-redux';
import { Persistor } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import { ReduxStore } from '@store/create-store';
import withRedux from '@store/with-redux';
import BlogPortals from '@components/portal/blog-portals';

const RootApp: React.FC<RootProps> = ({
  Component,
  pageProps,
  reduxStore,
  reduxPersistor,
}) => (
  <Provider store={reduxStore}>
    <PersistGate
      // loading={<Component {...pageProps} />}
      persistor={reduxPersistor}
    >
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <style global={true}>{`
          body {
            margin: 0px;
          }
        `}</style>
      </Head>
      <Component {...pageProps} />
      <BlogPortals />
    </PersistGate>
  </Provider>
);

interface RootProps extends AppInitialProps {
  Component: NextComponentType<NextPageContext, any, {}>;
  router: Router;
  reduxStore: ReduxStore;
  reduxPersistor: Persistor;
}

export default withRedux(RootApp as any);
