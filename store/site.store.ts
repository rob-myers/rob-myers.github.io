import create from 'zustand';
import { devtools } from 'zustand/middleware';
import type { KeyedLookup } from 'model/generic.model';
import type { ArticleKey } from 'articles/index';
import { NextRouter } from 'next/router';

export type State = {
  /** Key of currently viewed article */
  articleKey: null | ArticleKey;
  /** Key of last article we navigated to */
  navKey: null | ArticleKey;
  /** Last time a navigation was triggered (epoch ms) */
  lastNav: number;
  /** Articles available on current page */
  articles: KeyedLookup<ArticleState>;
  /** Tabs available on current page with a storeKey */
  tabs: KeyedLookup<TabsState>;
  readonly api: {
    updateArticleKey: (router?: NextRouter) => string | undefined; 
  };
};

const useStore = create<State>(devtools((set, get) => ({
  articleKey: null,
  navKey: null,
  lastNav: Date.now(),
  articles: {},
  tabs: {},
  api: {
    updateArticleKey: (router) => {
      const found = Object.values(get().articles).find(x => window.scrollY <= x.rect.bottom);
      if (found && found.key !== get().articleKey) {
        set({ articleKey: found.key });
        router?.replace(`${window.location.pathname}#${found.key}`);
        return found.key;
      }
    },
  },
}), 'site'));

interface ArticleState {
  key: ArticleKey;
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
