import React, { useRef } from 'react';
import { NextComponentType, NextPageContext } from 'next';
import { getWindow } from '@model/dom.model';
import { RootState } from './reducer';
import { initializeStore, ReduxStore } from './create-store';

const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__';

const getOrInitializeStore = (initialState?: RootState) => {
  const w = getWindow<{ __NEXT_REDUX_STORE__: ReduxStore }>();
  return w
    ? w[__NEXT_REDUX_STORE__] || (
      w[__NEXT_REDUX_STORE__] = initializeStore(initialState)
    ) 
    : initializeStore(initialState);
};

type IProps = { initialReduxState: RootState }
type Props = { pageProps?: any; reduxStore?: ReduxStore }

export default (App: NextComponentType<NextPageContext, IProps, Props>) => {
  // eslint-disable-next-line react/display-name
  return (props: Props & IProps) => {
    const reduxStore = useRef(getOrInitializeStore(props.initialReduxState));
    return <App {...props} reduxStore={reduxStore.current}  />;
  };
};
