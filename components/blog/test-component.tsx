import { useDispatch, useSelector } from 'react-redux';
import { Act } from '@store/test.duck';
import css from './blog.scss';
import { useState } from 'react';

export const PersistentCounter: React.FC = () => {
  // const [count, setCount] = useState(0);
  const count = useSelector(({ test }) => test.count);
  const dispatch = useDispatch();

  return (
    <section className={css.testSuite}>
      {count} &nbsp;
      <button onClick={() => dispatch(Act.testDecrement())}>-1</button>
      <button onClick={() => dispatch(Act.testIncrement())}>+1</button>
    </section>
  );
};

export const RandomNumber: React.FC = () => {
  const [randomNumber, setRandomNumber] = useState(generateRandomNumber());
  return (
    <div>
      {randomNumber} &nbsp;
      <button onClick={() => setRandomNumber(generateRandomNumber())}>
        generate
      </button>
    </div>
  );
};

function generateRandomNumber() {
  return Math.trunc(Math.random() * 100);
}
