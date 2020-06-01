export const exampleTsx1 = `
import * as React from 'react';

export const App: React.FC = () => {
    return (
        <div>
            // foo
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

interface ItemProps {
    id: number;
    remove: () => void;
}

const Item: React.FC<ItemProps> = (props) => (
    <div
        style={{ padding: 2, border: '1px solid #555' }}
        onClick={props.remove}
    >
        {props.id}
    </div>
);

export const App: React.FC = () => {
    const [items, setItems] = React.useState([...Array(10)].map((_, i) => i));
    return (
        <div style={{ padding: 10 }}>
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

export const exampleScss1 = `
.my-ancestral-class {
  .my-class {
    background: red;
  }
}
`.trim();
