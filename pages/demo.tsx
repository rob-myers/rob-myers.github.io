import { hot } from 'react-hot-loader/root';
import Head from 'next/head';
import { withRouter } from 'next/router';
import withRedux from '@store/with-redux';
import { WithRouterProps } from 'next/dist/client/with-router';

import Demo1 from '@components/demo/demo-1';
import Demo2 from '@components/demo/demo-2';

const demos = [1, 2];

const Demo: React.FC<WithRouterProps> = ({ router: { query } }) => {
  const id = Number(query.id) || -1;

  return (
    <section>
      <Head>
        <title>Demo</title>
      </Head>
      {demos.includes(id) && (
        <>
          <h1>Demo {id}</h1>
          {
            id === 1 && <Demo1/>
            || id === 2 && <Demo2/>
          }
        </>
      )}
    </section>
  );
};



export default hot(withRedux(withRouter(Demo)));
