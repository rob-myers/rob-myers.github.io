import { useState, useEffect } from 'react';
import useStore, { selectCount, selectApi } from '@store/test.store';

/**
 * Persistent because test.store is persisted in root component.
 */
const PersistentCounter: React.FC = () => {
  const count = useStore(selectCount);
  const { increment, decrement } = useStore(selectApi);
  const [localCount, setLocalCount] = useState(0);

  return (
    <section>
      {count} &nbsp;
      <button onClick={() => decrement()}>-1</button>
      <button onClick={() => increment()}>+1</button>
      
      <br/>

      Local count {localCount}
      <button onClick={() => setLocalCount(localCount + 1)}>
        +1
      </button>
    </section>
  );
};

export default PersistentCounter;
