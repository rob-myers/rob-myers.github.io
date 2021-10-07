import { NextRouter } from 'next/router';
import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { HtmlPortalNode } from 'react-reverse-portal';

import type { KeyedLookup } from 'model/generic.model';
import type { ArticleKey } from 'articles/index';
import type { TabMeta } from 'components/page/TabsAux';

export type State = {
  /** Key of currently viewed article */
  articleKey: null | ArticleKey;
  /** Articles available on current page */
  articles: KeyedLookup<ArticleState>;
  /** Last time a navigation was triggered (epoch ms) */
  lastNav: number;
  /** Key of last article we navigated to */
  navKey: null | ArticleKey;
  /** Currently available Tabs i.e. on current page */
  tabs: KeyedLookup<TabsState>;

  readonly api: {
    updateArticleKey: (router?: NextRouter) => string | undefined; 
  };
};

const useStore = create<State>(devtools((set, get) => ({
  articleKey: null,
  articles: {},
  lastNav: Date.now(),
  navKey: null,
  tabs: {},

  api: {
    updateArticleKey: (router) => {
      const found = Object.values(get().articles).find(x => window.scrollY <= x.rect.bottom);
      if (found) {
        if (found.key !== get().articleKey) {
          set({ articleKey: found.key });
          router?.replace(`${window.location.pathname}#${found.key}`);
        }
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
  def: TabMeta[];
  portal: HtmlPortalNode;
  selectTab: (tabId: string) => void;
  scrollIntoView: () => void;
}

const api = useStore.getState().api;
const useSiteStore = Object.assign(useStore, { api });

export default useSiteStore;
