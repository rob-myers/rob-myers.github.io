/*global process*/
import { Provider } from 'react-redux';
import App from 'next/app';
import { RootState } from './reducer';
import { NextComponentType, NextPageContext } from 'next';
import { AppContextType, AppType } from 'next/dist/next-server/lib/utils';
import { initializeStore, ReduxStore } from '.';

let reduxStore: ReturnType<typeof initializeStore>;
const getOrInitializeStore = (initialState?: RootState) => {
  if (typeof window === 'undefined') { // New store if server.
    return initializeStore(initialState);
  } else if (!reduxStore) { // Ensure client has store.
    reduxStore = initializeStore(initialState);
  }
  return reduxStore;
};

type PageComponent = NextComponentType | AppType;
type GetInitPropsCtxt = NextPageContext | AppContextType;

export const withRedux = (
  PageComponent: PageComponent,
  { ssr = true } = {}
) => {
  const WithRedux = ({ initialReduxState, ...props }: any) => {
    const store = getOrInitializeStore(initialReduxState);
    return (
      <Provider store={store}>
        <PageComponent {...props} />
      </Provider>
    );
  };

  if (process.env.NODE_ENV !== 'production') {
    // Make sure people don't use this HOC on _app.js level
    const isAppHoc =
      PageComponent === App || PageComponent.prototype instanceof App;
    if (isAppHoc) {
      throw new Error('The withRedux HOC only works with PageComponents');
    }

    // Set the correct displayName in development
    const displayName = (
      'displayName' in PageComponent && PageComponent.displayName
      || PageComponent.name
      || 'Component'
    );
    WithRedux.displayName = `withRedux(${displayName})`;
  }

  if (ssr || PageComponent.getInitialProps) {
    WithRedux.getInitialProps = async (
      context: GetInitPropsCtxt & { reduxStore: ReduxStore }
    ) => {
      // Get or Create the store with `undefined` as initialState
      // This allows you to set a custom default initialState
      const reduxStore = getOrInitializeStore();
      // Provide the store to getInitialProps of pages
      context.reduxStore = reduxStore;

      // Run getInitialProps from HOCed PageComponent
      // Pass props to PageComponent
      return {
        ...(
          typeof PageComponent.getInitialProps === 'function'
            ? await PageComponent.getInitialProps(context as any)
            : {}
        ),
        initialReduxState: reduxStore.getState(),
      };
    };
  }

  return WithRedux;
};
