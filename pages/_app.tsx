import { NextComponentType, NextPageContext } from 'next';
import { Router } from 'next/router';
import Head from 'next/head';
import { AppInitialProps } from 'next/app';
import { useEffect } from 'react';
import useTestStore from '@store/test.store';

import 'xterm/css/xterm.css';

const RootApp: React.FC<RootProps> = ({
  Component,
  pageProps,
}) => {

  // Persist the test.store
  useEffect(() => {
    useTestStore.getState().persist.restore();
    return useTestStore.subscribe(({ persist }) => persist.save());
  }, []);

  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <style //@ts-ignore
          global="true"
        >
        {`
          body {
            margin: 0px;
          }
        `}
        </style>
      </Head>
      <Component {...pageProps} />
    </>
  );
};

interface RootProps extends AppInitialProps {
  Component: NextComponentType<NextPageContext, any, {}>;
  router: Router;
}

export default RootApp;
