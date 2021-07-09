import { NextComponentType, NextPageContext } from 'next';
import { AppInitialProps } from 'next/app';
import Head from 'next/head';
import { Router } from 'next/router';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import 'xterm/css/xterm.css';
import 'styles/globals.css'
import 'codemirror/lib/codemirror.css';
import 'components/code/codemirror/custom-theme.css';

const queryClient = new QueryClient;

const PagesRoot: React.FC<RootProps> = ({ Component, pageProps }) => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(function(reg) {
        if(reg.installing) {
          console.info('Service worker installing');
        } else if(reg.waiting) {
          console.info('Service worker installed');
        } else if(reg.active) {
          console.info('Service worker active');
        }
      }).catch(function(error) {
        console.error('Service worker registration failed with ' + error);
      });
    }

  }, []);

  return (
    <>
      <Head>
          <title>
            esc the base
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
