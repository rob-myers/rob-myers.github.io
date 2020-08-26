import { SetState, GetState } from 'zustand';

interface PersistDef<T, U = Partial<T>> {
  key: string;
  save: (state: T) => U;
  restore: (saved: U) => Partial<T>;
}

export interface PersistApi<T, U = Partial<T>> {
  readonly persist: {
    readonly save: () => void;
    readonly restore:  () => void;
  };
}

export const withPersist = <T, U = Partial<T>>(
  def: PersistDef<T, U>,
  set: SetState<T>,
  get: GetState<T>,
): PersistApi<T, U> => ({
  persist: {
    save: () => {
      const saved = def.save(get());
      localStorage.setItem(def.key, JSON.stringify(saved));
    },
    restore: () =>
      set(_ => def.restore(
        JSON.parse(localStorage.getItem(def.key) || '{}')
      )),
  },
});
