import Head from 'next/head';
import type { NextComponentType, NextPageContext } from 'next';
import type { AppInitialProps } from 'next/app';
import type { Router } from 'next/router';
import React from 'react';

//#region polyfill
// NOTE dynamic ResizeObserver import does not work e.g. Safari 12.1.2
import { ResizeObserver } from '@juggle/resize-observer';
if (typeof window !== 'undefined') {
  history.scrollRestoration = 'manual';
  if (('ResizeObserver' in window) === false) {
    window.ResizeObserver = ResizeObserver;
  }

  if (('scrollBehavior' in document.documentElement.style) === false) {
    import('smoothscroll-polyfill')
      .then(x => x.default.polyfill())
      // .then(() => import('smoothscroll-anchor-polyfill'));
  }
  if (('onpointerdown' in document.documentElement) === false) {
    import('pepjs');
  }
  //@ts-ignore
  import('web-animations-js');
}
//#endregion

import { setup } from 'goober';
import { shouldForwardProp } from 'goober/should-forward-prop';
setup(
  React.createElement, undefined, undefined,
  shouldForwardProp(prop => !prop.startsWith('__')),
);

import { QueryClient, QueryClientProvider } from 'react-query';
const queryClient = new QueryClient;

import { Nav, Portals } from 'components/dynamic';

import 'components/globals.css';
import 'xterm/css/xterm.css';
import 'flexlayout-react/style/light.css'
import 'codemirror/lib/codemirror.css';
import 'components/code/codemirror/custom-theme.css';

export default function PagesRoot({ Component, pageProps }: RootProps) {
  return <>
    <Head>
      <title>
        Spaceship Markup
      </title>
    </Head>
    <QueryClientProvider client={queryClient} >
      <Nav />
      <Component {...pageProps} />
      <Portals />
    </QueryClientProvider>
  </>;
}

interface RootProps extends AppInitialProps {
  Component: NextComponentType<NextPageContext, any, {}>;
  router: Router;
}
