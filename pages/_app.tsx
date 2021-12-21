import { NextComponentType, NextPageContext } from 'next';
import Head from 'next/head';
import { AppInitialProps } from 'next/app';
import { Router } from 'next/router';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import { queryClient } from 'store/site.store';

import { ResizeObserver } from '@juggle/resize-observer';
if (typeof window !== 'undefined') {
  history.scrollRestoration = 'manual';

  //#region polyfill
  if (!window.ResizeObserver) {
    window.ResizeObserver = ResizeObserver;
  }
  if (!('scrollBehavior' in document.documentElement.style)) {
    import('smoothscroll-polyfill')
      .then(x => x.default.polyfill())
      // .then(() => import('smoothscroll-anchor-polyfill'));
  }
  if (!('onpointerdown' in document.documentElement)) {
    import('pepjs');
  }
  //#endregion
}

import { setup } from 'goober';
import { shouldForwardProp } from 'goober/should-forward-prop';
setup(
  React.createElement, undefined, undefined,
  shouldForwardProp(prop => !prop.startsWith('__')),
);

import Nav from 'components/page/Nav';
import Portals from 'components/page/Portals';

import 'components/globals.css';
import 'xterm/css/xterm.css';
import 'flexlayout-react/style/light.css'
import 'codemirror/lib/codemirror.css';
import 'components/code/codemirror/custom-theme.css';

export default function PagesRoot({ Component, pageProps }: RootProps) {
  return <>
    <Head>
      <title>
        Rogue Markup
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
