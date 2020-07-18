/**
 * util.ts
 */
export const defaultUtilTs = `
/**
 * Can be used as a NOOP, testing whether a type is never,
 * e.g. \`default: return state || testNever(act)\`.
 */
export function testNever(x: never, shouldThrow = false): any {
  if (shouldThrow) {
    throw new Error(\`testNever: \${JSON.stringify(x)} not implemented.\`);
  }
  return null;
}

`.trim();

/**
 * reducer.ts
 */
export const defaultReducerTs = `

import { combineReducers } from 'redux';

import {
  reducer as testReducer,
  State as TestState, 
  Action as TestAction,
} from './store/test.duck';

export interface RootState {
  test: TestState;
  // ...
}

export type RootAction = (
  | TestAction
  // ...
);

const createRootReducer = () => combineReducers({
  test: testReducer,
  // ...
});

export default createRootReducer;

`.trim();

/**
 * store/redux.model.ts
 */
export const defaultReduxModelTs = `

export const createSync = <T extends string, P extends object = {}>(
  type: T,
  payload: P
): SyncAct<T, P> => ({ type, payload });

export interface SyncAct<T extends string, Payload extends null | {}> {
  type: T;
  payload: Payload;
}

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
import { testNever } from '../util';
import { createSync, ActionsUnion } from './redux.model';

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
import css from './index.scss';

// import { baz } from './model';
// console.log({ baz })

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
  return (
    <div className={css.myAncestralClass}>
      {items.map(x => (
        <Item
          id={x}
          key={x}
          remove={() => setItems(items.filter(y => y !== x))}
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
