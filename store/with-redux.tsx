import React from 'react';
import { NextComponentType, NextPageContext } from 'next';
import { RootState } from './reducer';
import { initializeStore, ReduxStore } from '.';

const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__';
type Window = typeof window & { __NEXT_REDUX_STORE__: ReduxStore }

const getOrInitializeStore = (initialState?: RootState) => {
  if (typeof window === 'undefined') {
    return initializeStore(initialState);
  }
  return (
    (window as Window)[__NEXT_REDUX_STORE__]
    || ((window as Window)[__NEXT_REDUX_STORE__] = initializeStore(initialState))
  );
};


type IProps = { initialReduxState: RootState }
type Props = { pageProps: any; reduxStore: ReduxStore }
type AppContext = NextPageContext & { ctx: { reduxStore: ReduxStore }  }

export default (App: NextComponentType<NextPageContext, IProps, Props>) => {
  return class AppWithRedux extends React.Component<Props> {
    private reduxStore: ReduxStore;

    static async getInitialProps(appContext: AppContext): Promise<IProps | Props> {
      const reduxStore = getOrInitializeStore();
      // console.log({ appContext });
      // appContext.ctx.reduxStore = reduxStore;

      return {
        ...(
          typeof App.getInitialProps === 'function'
            ? await App.getInitialProps(appContext)
            : {}
        ),
        initialReduxState: reduxStore.getState(),
      };
    }

    constructor(props: IProps & Props) {
      super(props);
      this.reduxStore = getOrInitializeStore(props.initialReduxState);
    }

    render() {
      return <App {...this.props} reduxStore={this.reduxStore}  />;
    }
  };
};

