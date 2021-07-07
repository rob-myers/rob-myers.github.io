import { NextComponentType, NextPageContext } from 'next';
import { AppInitialProps } from 'next/app';
import Head from 'next/head';
import { Router } from 'next/router';
import { useEffect } from 'react';

import 'xterm/css/xterm.css';
import 'styles/globals.css'
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';

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
      <Component {...pageProps} />
    </>
  );
}

interface RootProps extends AppInitialProps {
  Component: NextComponentType<NextPageContext, any, {}>;
  router: Router;
}

export default PagesRoot
