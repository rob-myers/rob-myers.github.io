import { NextComponentType, NextPageContext } from 'next';
import { Router } from 'next/router';
import Head from 'next/head';
import { AppInitialProps } from 'next/app';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import withRedux from '@store/with-redux';
import BlogPortals from '@components/portal/blog-portals';

const RootApp: React.FC<RootProps> = ({
  Component,
  pageProps,
}) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch({ type: '[geom] initialize service', args: {} });
  }, []);

  return (
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
}

interface RootProps extends AppInitialProps {
  Component: NextComponentType<NextPageContext, any, {}>;
  router: Router;
}

export default withRedux(RootApp as any);
