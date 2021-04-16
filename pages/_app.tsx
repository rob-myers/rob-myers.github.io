import { useEffect } from 'react';
import { NextComponentType, NextPageContext } from 'next';
import { AppInitialProps } from 'next/app';
import { Router } from 'next/router';
import useGeomStore from 'store/geom.store';

import 'xterm/css/xterm.css';
import 'styles/globals.css'

const PagesRoot: React.FC<RootProps> = ({ Component, pageProps }) => {
  useEffect(() => { useGeomStore.api.loadTextures() }, []);
  return <Component {...pageProps} />
}

interface RootProps extends AppInitialProps {
  Component: NextComponentType<NextPageContext, any, {}>;
  router: Router;
}

export default PagesRoot
