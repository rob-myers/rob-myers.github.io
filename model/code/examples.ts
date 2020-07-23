/**
 * reducer.ts
 */
export const defaultReducerTs = `

import { combineReducers } from 'redux';

import {
  reducer as testReducer,
  State as TestState, 
  Action as TestAction,
  Thunk as TestThunk,
} from './store/test.duck';

export interface RootState {
  test: TestState;
}

export type RootAction = (
  | TestAction
);

export type ThunkAction = (
  | TestThunk
);

/** Provides thunks to our thunk middleware */
export const Thunk = {
  ...TestThunk,
};

export type Dispatchable = (
  | RootAction
  | Omit<ThunkAction, 'thunk'>
)

const createRootReducer = () => combineReducers({
  test: testReducer,
  // ...
});

/** Defines initial state and synchronous actions */
export default createRootReducer;

`.trim();

/**
 * module/core/custom-types.d.ts
 */
export const moduleCoreCustomTypesDTs = `

import { RootState, Dispatchable, ThunkAction } from '@reducer';

declare module 'react-redux' {
  function useSelector<T = any>(selector: (state: RootState) => T, equalityFn?: Function): T;
  function useDispatch(): <T extends Dispatchable>(arg: T) =>
    T['type'] extends ThunkAction['type']
      ? ReturnType<Extract<ThunkAction, { type: T['type'] }>['thunk']>
      : void;
}

`.trim();

/**
 * module/core/redux.model.ts
 */
export const moduleCoreReduxModelTs = `

//#region sync
export const createSync = <T extends string, P extends object = {}>(
  type: T,
  payload: P
): SyncAct<T, P> => ({ type, payload });

export interface SyncAct<T extends string, Payload extends null | {}> {
  type: T;
  payload: Payload;
}
//#endregion

//#region thunk
import { RootState, RootAction } from '@reducer';

export interface RootThunkParams {
  dispatch: <T extends RootAction | ThunkAct<string, any, any>>(arg: T) => ThunkActReturnType<T>;
  getState: () => RootState;
  state: RootState;
}

export type ThunkActReturnType<T> = T extends ThunkAct<string, any, infer R> ? R : any;

export interface ThunkAct<T extends string, A extends {}, R> {
  type: T;
  thunk: (params: RootThunkParams, args: A) => R;
  args: A;
}

export const createThunk = <T extends string, A extends {} = {}, R = void>(
  type: T,
  thunk: ThunkAct<T, A, R>['thunk']
) => Object.assign((args: A) =>
  ({
    type,
    thunk,
    args
  } as ThunkAct<T, A, R>), { type });
//#endregion

interface ActionCreatorsMapObject {
  [actionCreator: string]: (...args: any[]) => any
}

export type ActionsUnion<A extends ActionCreatorsMapObject> =
  ReturnType<A[keyof A]>;


`.trim();

/**
 * store/test.duck.ts
 */
export const defaultTestDuckTs = `
import { testNever } from '@module/core/util';
import { createSync, createThunk, ActionsUnion } from '@module/core/redux.model';

export interface State {
  count: number;
}

const initialState: State = {
  count: 0,
};

export const Act = {
  increment: () => createSync('[test] increment', {}),
  reset: () => createSync('[test] reset', {}),
};

export type Action = ActionsUnion<typeof Act>;

export const Thunk = {
  delayedIncrement: createThunk(
    '[test] delayed increment',
    ({ dispatch }, { delayMs }: { delayMs: number }) =>
      window.setTimeout(() => dispatch({ type: '[test] increment', payload: {} }), delayMs),
  ),
};

export type Thunk = ActionsUnion<typeof Thunk>;

export const reducer = (state = initialState, act: Action): State => {
  switch (act.type) {
    case '[test] increment': return { ...state,
      count: state.count + 1,
    };
    case '[test] reset': return { ...state,
      count: 0,
    };
    default: return state || testNever(act);
  }
};
`.trim();

export const moduleCoreUtilTs = `

/** Usage e.g. \`default: return state || testNever(act)\`. */
export function testNever(_: never): any {
  /** NOOP */
}

`.trim();

/**
 * EXAMPLES BELOW
 */

export const exampleTsx1 = `
import * as React from 'react';

export const App: React.FC = () => {
    return (
        <div>
            // foo {0 + 0}
            <br/>
            {'//'} foo {0 + 0}
        </div>
    );
};

export default App;
`.trim();

export const exampleTsx2 = `
import * as React from 'react';

const App: React.FC = () => {
  return (
    <div className="App">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.9 595.3">
        <circle cx="10" cy="10" r="10" fill="red"/>
      </svg>
    </div>
  );
}

export default App;
`.trim();

export const exampleTsx3 = `

import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import css from './index.scss';

interface ItemProps {
  id: number;
  remove: () => void;
}

const Item: React.FC<ItemProps> = (props) => (
  <div
    onClick={props.remove}
    className={css.myClass}
  >
    <div>
      {props.id}
    </div>
  </div>
);

export const App: React.FC = () => {
  const [items, setItems] = React.useState([...Array(20)].map((_, i) => i));

  const dispatch = useDispatch();
  const count = useSelector(({ test }) => test.count);

  return (
    <div className={css.myAncestralClass}>
      {items.map(x => (
        <Item
          id={x}
          key={x}
          remove={() => {
            setItems(items.filter(y => y !== x));
            dispatch({ type: '[test] increment', payload: {} });
            dispatch({ type: '[test] delayed increment', args: { delayMs: 1000 } });
          }}
        />
      ))}
    </div>
  );
};

export default App;
`.trim();

export const exampleScss1 = `
@import "./other.scss";

.my-ancestral-class {
  overflow: auto;
  height: 100%;

  .my-class {
    @include myMixin;
    background: rgba(255, 0, 0, 0.623);
  }
}
`.trim();

export const exampleScss2 = `
.other-class {
  color: green;
}

@mixin myMixin {
  color: #ccc;
  border: 1px solid black;
  cursor: pointer;
  padding: 2px 12px;
}
`.trim();
