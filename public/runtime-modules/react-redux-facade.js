import { LIVE_REACT_REDUX } from '/constants.js';
const reactRedux = window[LIVE_REACT_REDUX];

const {
  Provider,
  ReactReduxContext,
  batch,
  useDispatch,
  createDispatchHook,
  useSelector,
  createSelectorHook,
  useStore,
  createStoreHook,
  shallowEqual,
} = reactRedux;

export {
  Provider,
  ReactReduxContext,
  batch,
  useDispatch,
  createDispatchHook,
  useSelector,
  createSelectorHook,
  useStore,
  createStoreHook,
  shallowEqual,
};
