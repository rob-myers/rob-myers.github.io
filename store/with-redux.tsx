import React, { useRef } from 'react';
import { NextComponentType, NextPageContext } from 'next';
import { Provider } from 'react-redux';
import { persistStore, Persistor } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';

import { NEXT_REDUX_STORE, NEXT_REDUX_PERSISTOR } from '@public/constants';
import { getWindow } from '@model/dom.model';
import { RootState } from './reducer';
import { initializeStore, ReduxStore } from './create-store';

export default (App: NextComponentType<NextPageContext, IProps, Props>) => {
  return (props: Props & IProps) => {
    const reduxStore = useRef(getOrInitializeStore(props.initialReduxState));
    const reduxPersistor = useRef(getOrInitializePersistor(reduxStore.current));
    return (
      <Provider store={reduxStore.current}>
        <PersistGate
          // loading={<Component {...pageProps} />}
          persistor={reduxPersistor.current}
        >
          <App {...props} />
        </PersistGate>
      </Provider>
      );
  };
};

function getOrInitializeStore(initialState?: RootState): ReduxStore {
  const window = getWindow<{ __NEXT_REDUX_STORE__: ReduxStore }>();
  if (!window) {
    return initializeStore(initialState);
  } else if (!window[NEXT_REDUX_STORE]) {
    return window[NEXT_REDUX_STORE] = initializeStore(initialState);
  }
  return window[NEXT_REDUX_STORE];
}

function getOrInitializePersistor(store: ReduxStore) {
  const window = getWindow<{ __NEXT_REDUX_PERSISTOR__: Persistor }>();
  if (!window) {
    return persistStore(store);
  } else if (!window[NEXT_REDUX_PERSISTOR]) {
    return window[NEXT_REDUX_PERSISTOR] = persistStore(store);
  }
  return window[NEXT_REDUX_PERSISTOR];
}

interface IProps {
  initialReduxState: RootState;
}

interface Props {
  pageProps?: any;
}
