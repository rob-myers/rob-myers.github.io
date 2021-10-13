import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { HtmlPortalNode } from 'react-reverse-portal';

import type { KeyedLookup } from 'model/generic.model';
import type { ArticleKey } from 'articles/index';
import type { TabMeta } from 'components/page/TabsAux';
import { last } from 'lodash';

export type State = {
  /** Key of currently viewed article */
  articleKey: null | ArticleKey;
  /** Articles available on current page */
  articles: KeyedLookup<ArticleState>;
  /** Currently available Tabs i.e. on current page */
  tabs: KeyedLookup<TabsState>;

  readonly api: {
    updateArticleKey: () => void;
  };
};

const useStore = create<State>(devtools((set, get) => ({
  articleKey: null,
  articles: {},
  tabs: {},

  api: {
    updateArticleKey: () => {
      const articles = Object.values(get().articles);
      let article = undefined as undefined | ArticleState;
      const offset = 64; // Offset must cover `article > div.anchor`

      if (window.scrollY + offset >= document.body.offsetHeight - window.innerHeight) {
        article = last(articles);
      } else {
        article = articles.find(x => window.scrollY + offset <= x.rect.bottom);
      }

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
