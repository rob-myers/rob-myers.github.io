import create from 'zustand';
import { PersistApi, withPersist } from './persist';

export interface State extends PersistApi<State> {
  count: number;
  lastPing: null | string;
  readonly api: {
    readonly ping: () => void;
    readonly increment: () => void;
    readonly decrement: () => void;
    readonly setCount: (count: number) => void;
  };
}

type Persisted = Pick<State, 'count' | 'lastPing'>;

const useStore = create<State>((set, get) => ({
  count: 0,
  lastPing: null,
  api: {
    ping: () => set(_ => ({ lastPing: `${Date()}` })),
    decrement: () => set(({ count }) => ({ count: count - 1 })),
    increment: () => set(({ count }) => ({ count: count + 1 })),
    setCount: (count) => set(_ => ({ count })),
  },
  ...withPersist<State, Persisted>({
    key: 'test',
    save: ({ count, lastPing }) => ({ count, lastPing }),
    restore: (saved) => saved,
  }, set, get),
}));

export const selectCount = ({ count }: State) => count;
export const selectApi = ({ api }: State) => api;

export default useStore;
