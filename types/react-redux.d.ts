import { RootState } from '@store/reducer';

declare module 'react-redux' {
  function useSelector<T = any>(selector: (state: RootState) => T, equalityFn?: Function): T;
}

declare module 'node-sass' {
  export default function withSass(world: string): void;
}
