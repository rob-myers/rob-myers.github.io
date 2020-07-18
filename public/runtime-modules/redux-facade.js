import { LIVE_REDUX } from '/constants.js';
const redux = window[LIVE_REDUX];

const {
  n,
  a,
  i,
  c,
  o,
} = redux;

export {
  n as __DO_NOT_USE__ActionTypes,
  a as applyMiddleware,s as bindActionCreators,
  i as combineReducers,
  c as compose,
  o as createStore,
};

export default redux;
