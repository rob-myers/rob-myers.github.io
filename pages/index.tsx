import { useEffect } from 'react';
import { hot } from 'react-hot-loader/root';
import withRedux from '@store/with-redux';
import css from './index.scss';
import Demo1 from '@components/demo/demo-1';

// @ts-ignore
import ExampleWorker from '@worker/example.worker';

const Home: React.FC = () => {

  useEffect(() => {
    const worker: Worker = new ExampleWorker();
    worker.postMessage({ fromHost: 'fromHost'});
    worker.addEventListener('message', (event: any) => console.log({ receivedFromWorker: event }));

    return () => worker.terminate();
  }, []);

  return (
    <div className={css.root}>
      <h1>Hello, world!</h1>
      <Demo1 />
    </div>  
  );
};

export default hot(withRedux(Home));


