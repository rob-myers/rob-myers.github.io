import { NextComponentType, NextPageContext } from 'next';
import { AppInitialProps } from 'next/app';
import { Router } from 'next/router';

import 'xterm/css/xterm.css';
import 'styles/globals.css'
import { useEffect } from 'react';
import * as THREE from 'three';

const PagesRoot: React.FC<RootProps> = ({ Component, pageProps }) => {
  useEffect(() => {
    window.THREE = THREE; // Used by /npm/three.js

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(function(reg) {
        if(reg.installing) {
          console.log('Service worker installing');
        } else if(reg.waiting) {
          console.log('Service worker installed');
        } else if(reg.active) {
          console.log('Service worker active');
        }
      }).catch(function(error) {
        console.log('Registration failed with ' + error);
      });
    }

  }, []);

  return <Component {...pageProps} />
}

interface RootProps extends AppInitialProps {
  Component: NextComponentType<NextPageContext, any, {}>;
  router: Router;
}

export default PagesRoot
