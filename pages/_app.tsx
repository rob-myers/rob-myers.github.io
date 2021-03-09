import { NextComponentType, NextPageContext } from 'next';
import { AppInitialProps } from 'next/app';
import { Router } from 'next/router';
import { useEffect } from 'react';

import 'xterm/css/xterm.css';
import 'styles/globals.css'
import useGeomStore from 'store/geom.store';

const MyApp: React.FC<RootProps> = ({ Component, pageProps }) => {

  useEffect(() => {
    useGeomStore.api.load();
  }, []);

  return <Component {...pageProps} />
}

interface RootProps extends AppInitialProps {
  Component: NextComponentType<NextPageContext, any, {}>;
  router: Router;
}

export default MyApp
