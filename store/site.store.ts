import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { KeyedLookup } from 'model/generic.model';

export type State = {
  /** Key of current article on current page */
  articleKey: null | string;
  /** Articles available on current page */
  articles: KeyedLookup<ArticleState>;
  /** Tabs available on current page with a storeKey */
  tabs: KeyedLookup<TabsState>;
  readonly api: {
    updateArticleKey: (scrollY: number) => void; 
  };
};

const useStore = create<State>(devtools((set, get) => ({
  articleKey: null,
  articles: {},
  tabs: {},
  api: {
    updateArticleKey: (scrollY) => {
      const found = Object.values(get().articles).find(x => scrollY < x.rect.bottom);
      if (found && found.key !== get().articleKey) {
        set({ articleKey: found.key });
      }
    },
  },
}), 'site'));

interface ArticleState {
  key: string;
  rect: DOMRect;
}

interface TabsState {
  key: string;
  selectTab: (tabId: string) => void;
  scrollIntoView: () => void;
}

const api = useStore.getState().api;
const useSiteStore = Object.assign(useStore, { api });

export default useSiteStore;
