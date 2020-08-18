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
      <style global={true}>{`
        body {
          margin: 0px;
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
