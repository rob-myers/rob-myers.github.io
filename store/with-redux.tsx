import React, { useRef } from 'react';
import { NextComponentType, NextPageContext } from 'next';
import { NEXT_REDUX_STORE } from '@public/constants';
import { getWindow } from '@model/dom.model';
import { RootState } from './reducer';
import { initializeStore, ReduxStore } from './create-store';

export default (App: NextComponentType<NextPageContext, IProps, Props>) => {
  return (props: Props & IProps) => {
    const reduxStore = useRef(getOrInitializeStore(props.initialReduxState));
    return <App {...props} reduxStore={reduxStore.current}  />;
  };
};

function getOrInitializeStore(initialState?: RootState) {
  const window = getWindow<{ __NEXT_REDUX_STORE__: ReduxStore }>();
  return window
    ? window[NEXT_REDUX_STORE] || (
      window[NEXT_REDUX_STORE] = initializeStore(initialState)
    ) 
    : initializeStore(initialState);
}

interface IProps {
  initialReduxState: RootState;
}

interface Props {
  pageProps?: any;
  reduxStore?: ReduxStore;
}
