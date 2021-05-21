import { NextComponentType, NextPageContext } from 'next';
import { AppInitialProps } from 'next/app';
import { Router } from 'next/router';

import 'xterm/css/xterm.css';
import 'styles/globals.css'
import { useEffect } from 'react';
import * as THREE from 'three';

const PagesRoot: React.FC<RootProps> = ({ Component, pageProps }) => {
  useEffect(() => {
    window.THREE = THREE; // Shortcut for code.lib
  }, []);

  return <Component {...pageProps} />
}

interface RootProps extends AppInitialProps {
  Component: NextComponentType<NextPageContext, any, {}>;
  router: Router;
}

export default PagesRoot
