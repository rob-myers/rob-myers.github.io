import create from 'zustand';
import { KeyedLookup } from 'model/generic.model';
import { Model } from 'flexlayout-react';

export type State = {
  tabs: KeyedLookup<TabsState>;
  readonly api: {};
};

const useStore = create<State>((set, get) => ({
  tabs: {},
  api: {},
}));

interface TabsState {
  key: string;
  selectTab: (tabId: string) => void;
  scrollIntoView: () => void;
}

const api = useStore.getState().api;
const useSiteStore = Object.assign(useStore, { api });

export default useSiteStore;
