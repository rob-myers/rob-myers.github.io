import { NextComponentType, NextPageContext } from 'next';
import { Router } from 'next/router';
import Head from 'next/head';
import { AppInitialProps } from 'next/app';

import withRedux from '@store/with-redux';
import BlogPortals from '@components/portal/blog-portals';

const RootApp: React.FC<RootProps> = ({
  Component,
  pageProps,
}) => (
  <>
    <Head>
      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="preload" href="/fonts/Quicksand-Regular.otf" as="font" crossOrigin="" />
      <link rel="preload" href="/fonts/Montserrat-Regular.otf" as="font" crossOrigin="" />
      <style global={true}>{`
        body {
          margin: 0px;
        }
        @font-face {
          font-family: 'Helvetica-Now';
          src: url('/fonts/HelveticaNowText-Light.woff2');
          font-style: normal;
          font-display: swap;
        }
      `}</style>
    </Head>
    <Component {...pageProps} />
    <BlogPortals />
  </>
);

interface RootProps extends AppInitialProps {
  Component: NextComponentType<NextPageContext, any, {}>;
  router: Router;
}

export default withRedux(RootApp as any);
