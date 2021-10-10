import { NextComponentType, NextPageContext } from 'next';
import Head from 'next/head';
import { AppInitialProps } from 'next/app';
import { Router } from 'next/router';
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { ResizeObserver } from '@juggle/resize-observer';
if (typeof window !== 'undefined') {
  window.ResizeObserver = window.ResizeObserver || ResizeObserver;
}

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

  useEffect(() => {
    if (!('scrollBehavior' in document.documentElement.style)) {
      // For Safari, and combined with NextJS patch
      // https://github.com/rob-myers/rob-myers.github.io/commit/2272840c2e62c58482cff884a77fa9721b943f32
      import('smoothscroll-polyfill')
        .then(x => x.default.polyfill())
        .then(() => import('smoothscroll-anchor-polyfill'));
    }
  }, []);

  return <>
    <Head>
      <title>
        Rogue Markup
      </title>
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
