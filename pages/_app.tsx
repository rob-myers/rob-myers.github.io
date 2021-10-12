import { NextComponentType, NextPageContext } from 'next';
import Head from 'next/head';
import { AppInitialProps } from 'next/app';
import { Router } from 'next/router';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

//#region polyfill
import { ResizeObserver } from '@juggle/resize-observer';
if (typeof window !== 'undefined') {
  if (!window.ResizeObserver) {
    window.ResizeObserver = ResizeObserver
  }
  if (!('onpointerdown' in document.documentElement)) {
    import('pepjs');
  }
}
//#endregion

import { setup } from 'goober';
import { shouldForwardProp } from 'goober/should-forward-prop';
setup(
  React.createElement, undefined, undefined,
  shouldForwardProp(prop => !prop.startsWith('__')),
);

import Nav from 'components/page/Nav';

import 'components/globals.css';
import 'xterm/css/xterm.css';
import 'flexlayout-react/style/light.css'
import 'codemirror/lib/codemirror.css';
import 'components/code/codemirror/custom-theme.css';

const queryClient = new QueryClient;

const PagesRoot: React.FC<RootProps> = ({ Component, pageProps }) => {
  return <>
    <Head>
      <title>
        Rogue Markup
      </title>
      <script>history.scrollRestoration = "manual"</script>    
    </Head>
    <QueryClientProvider client={queryClient} >
      <Nav/>
      <Component {...pageProps} />
    </QueryClientProvider>
  </>;
}

interface RootProps extends AppInitialProps {
  Component: NextComponentType<NextPageContext, any, {}>;
  router: Router;
}

export default PagesRoot
