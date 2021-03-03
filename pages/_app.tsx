import { NextComponentType, NextPageContext } from 'next';
import { AppInitialProps } from 'next/app';
import { Router } from 'next/router';

import 'xterm/css/xterm.css';
import 'styles/globals.css'

const MyApp: React.FC<RootProps> = ({ Component, pageProps }) => {
  return <Component {...pageProps} />
}

interface RootProps extends AppInitialProps {
  Component: NextComponentType<NextPageContext, any, {}>;
  router: Router;
}

export default MyApp
