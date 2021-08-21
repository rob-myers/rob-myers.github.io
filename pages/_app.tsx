import { NextComponentType, NextPageContext } from 'next';
import { AppInitialProps } from 'next/app';
import Head from 'next/head';
import { Router } from 'next/router';

import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { setup } from 'goober';
setup(React.createElement);

import 'styles/globals.css'
import 'xterm/css/xterm.css';
import 'codemirror/lib/codemirror.css';
import 'components/code/codemirror/custom-theme.css';
import 'flexlayout-react/style/light.css'

const queryClient = new QueryClient;

const PagesRoot: React.FC<RootProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
          <title>
            Rogue Markup
          </title>
      </Head>
      <QueryClientProvider client={queryClient} >
        <Component {...pageProps} />
      </QueryClientProvider>
    </>
  );
}

interface RootProps extends AppInitialProps {
  Component: NextComponentType<NextPageContext, any, {}>;
  router: Router;
}

export default PagesRoot
