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

import { baz } from './model';
console.log({ baz })

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
  const [items, setItems] = React.useState([...Array(100)].map((_, i) => i));
  return (
    <div className={css.myAncestralClass}>
      {items.map(x => (
        <Item
          id={x}
          remove={() => setItems(items.filter(y => y !== x))}
        />
      ))}
    </div>
  );
};

export default App;
`.trim();

export const exampleTs1 = `
export const foo = 'bar';
export const baz = 'qux';
`.trim();

export const exampleScss1 = `
@import "./other.scss";

.my-ancestral-class {
  overflow: auto;
  height: 100%;

  .my-class {
    @include myMixin;
    margin: 10px;
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
}
`.trim();
