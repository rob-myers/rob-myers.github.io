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
            dispatch({ type: '[test] increment', pay: {} });
            // dispatch({ type: '[test] delayed increment', args: { delayMs: 1000 } });
          }}
        />
      ))}
    </div>
  );
};

export default App;
