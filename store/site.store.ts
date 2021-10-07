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
  /** Should we ignore next hash change? */
  ignoreNextHash: boolean;
  /** Last time a navigation was triggered (epoch ms) */
  navAt: number;
  /** Key of last article we targeted */
  targetNavKey: null | ArticleKey;
  /** Currently available Tabs i.e. on current page */
  tabs: KeyedLookup<TabsState>;

  readonly api: {
    onLoadArticles: (cb: (state: State) => void) => void;
    updateArticleKey: () => string | undefined;
  };
};

const useStore = create<State>(devtools((set, get) => ({
  articleKey: null,
  articles: {},
  ignoreNextHash: false,
  loaded: false,
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
      const article = Object.values(get().articles)
        .find(x => window.scrollY <= x.rect.bottom);
      if (article) {
        if (article.key !== get().articleKey) {
          set({ articleKey: article.key });
        }
        if (get().targetNavKey) {
           set({ targetNavKey: null });
        }
        return article.key;
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
