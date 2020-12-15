import { NextComponentType, NextPageContext } from 'next';
import { Router } from 'next/router';
import Head from 'next/head';
import { AppInitialProps } from 'next/app';
import { useEffect } from 'react';

import useTestStore from '@store/test.store';
import Portals from '@components/portals';
import globalStyles from '@components/style/global.style';

import 'xterm/css/xterm.css';
import 'katex/dist/katex.min.css';

const RootApp: React.FC<RootProps> = ({
  Component,
  pageProps,
}) => {
  // Persist test.store
  useEffect(() => {
    useTestStore.getState().persist.restore();
    return useTestStore.subscribe(({ persist }) => persist.save());
  }, []);

  useEffect(() => {
    (async () => {
      // NOOP
    })();
  }, []);

  return <>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <Portals>
        {globalStyles}
        <Component {...pageProps} />
      </Portals>
  </>;
};

interface RootProps extends AppInitialProps {
  Component: NextComponentType<NextPageContext, any, {}>;
  router: Router;
}

export default RootApp;
