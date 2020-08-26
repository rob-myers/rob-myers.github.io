import { NextComponentType, NextPageContext } from 'next';
import { Router } from 'next/router';
import Head from 'next/head';
import { AppInitialProps } from 'next/app';

const RootApp: React.FC<RootProps> = ({
  Component,
  pageProps,
}) => {
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
    </>
  );
};

interface RootProps extends AppInitialProps {
  Component: NextComponentType<NextPageContext, any, {}>;
  router: Router;
}

export default RootApp;
