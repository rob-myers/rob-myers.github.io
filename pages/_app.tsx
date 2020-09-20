import { NextComponentType, NextPageContext } from 'next';
import { Router } from 'next/router';
import Head from 'next/head';
import { AppInitialProps } from 'next/app';
import { useEffect } from 'react';
import useTestStore from '@store/test.store';
import useGeomStore from '@store/geom.store';
import Portals from '@components/portals';

import 'xterm/css/xterm.css';

const RootApp: React.FC<RootProps> = ({
  Component,
  pageProps,
}) => {
  // Persist test.store
  useEffect(() => {
    useTestStore.getState().persist.restore();
    return useTestStore.subscribe(({ persist }) => persist.save());
  }, []);

  // Load rooms.gltf
  useEffect(() => {
    useGeomStore.getState().api.load();
  }, []);

  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <style
          //@ts-ignore
          global="true"
        >
        {`
          body {
            margin: 0px;
          }
        `}
        </style>
      </Head>
      <Portals>
        <Component {...pageProps} />
      </Portals>
    </>
  );
};

interface RootProps extends AppInitialProps {
  Component: NextComponentType<NextPageContext, any, {}>;
  router: Router;
}

export default RootApp;
