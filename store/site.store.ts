import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { HtmlPortalNode } from 'react-reverse-portal';

import type { KeyedLookup } from 'model/generic.model';
import type { ArticleKey } from 'articles/index';
import type { TabMeta } from 'components/page/TabsAux';
import { NextRouter } from 'next/router';

export type State = {
  /** Key of currently viewed article */
  articleKey: null | ArticleKey;
  /** Articles available on current page */
  articles: KeyedLookup<ArticleState>;
  /** Last time a navigation was triggered (epoch ms) */
  navAt: number;
  /** Key of last article we targeted */
  targetNavKey: null | ArticleKey;
  /** Currently available Tabs i.e. on current page */
  tabs: KeyedLookup<TabsState>;

  readonly api: {
    onLoadArticles: (cb: (state: State) => void) => void;
    updateArticleKey: () => void;
  };
};

const useStore = create<State>(devtools((set, get) => ({
  articleKey: null,
  articles: {},
  navAt: 0,
  tabs: {},
  targetNavKey: null,

  api: {
    onLoadArticles: (cb) => {
      if (Object.keys(get().articles).length) cb(get());
      else {
        const unsub = useSiteStore.subscribe(({ articles }) => {
          if (Object.keys(articles).length) cb(get()), unsub();
        });
      }
    },
    updateArticleKey: () => {
      const article = Object.values(get().articles).find(x => window.scrollY <= x.rect.bottom);
      if (article && article.key !== get().articleKey) {
        set({ articleKey: article.key });
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
