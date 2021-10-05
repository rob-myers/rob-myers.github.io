import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { KeyedLookup } from 'model/generic.model';

export type State = {
  /** Key of currently viewed article */
  articleKey: null | string;
  /** Key of last article we navigated to */
  lastNavKey: null | string;
  /** Articles available on current page */
  articles: KeyedLookup<ArticleState>;
  /** Tabs available on current page with a storeKey */
  tabs: KeyedLookup<TabsState>;
  readonly api: {
    updateArticleKey: () => void; 
  };
};

const useStore = create<State>(devtools((set, get) => ({
  articleKey: null,
  lastNavKey: null,
  articles: {},
  tabs: {},
  api: {
    updateArticleKey: () => {
      const found = Object.values(get().articles).find(x => window.scrollY < x.rect.bottom);
      if (found && found.key !== get().articleKey) {
        set({ articleKey: found.key });
      }
    },
  },
}), 'site'));

interface ArticleState {
  key: string;
  /** Article bounds in coords relative to page (not viewport) */
  rect: Geom.Rect;
}

interface TabsState {
  key: string;
  selectTab: (tabId: string) => void;
  scrollIntoView: () => void;
}

const api = useStore.getState().api;
const useSiteStore = Object.assign(useStore, { api });

export default useSiteStore;
