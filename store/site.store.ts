import create from 'zustand';
import { devtools } from 'zustand/middleware';
import type { HtmlPortalNode } from 'react-reverse-portal';
import type { TabNode } from 'flexlayout-react';

import { KeyedLookup, last } from 'model/generic.model';
import type { TabMeta } from 'model/tabs/tabs.model';
import type { ArticleKey } from 'articles/index';

export type State = {
  /** Key of currently viewed article */
  articleKey: null | ArticleKey;
  /** <Article>s on current page */
  articles: KeyedLookup<ArticleState>;
  navOpen: boolean;
  /** Site-wide portals, corresponding to individual tabs */
  portal: KeyedLookup<PortalState>;
  /** <Tabs> on current page */
  tabs: KeyedLookup<TabsState>;

  readonly api: {
    updateArticleKey: () => void;
  };
};

const useStore = create<State>(devtools((set, get) => ({
  articleKey: null,
  articles: {},
  navOpen: false,
  portal: {},
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

export interface PortalState {
  key: string;
  meta: TabMeta;
  portal: HtmlPortalNode;
  component?: ((props: { disabled?: boolean; }) => JSX.Element);
}

interface TabsState {
  key: string;
  def: TabMeta[];
  disabled: boolean;
  /** e.g. `/part/1` */
  pagePathname: string;
  selectTab: (tabId: string) => void;
  scrollTo: () => void;
  getTabNodes: () => TabNode[];
}

const api = useStore.getState().api;
const useSiteStore = Object.assign(useStore, { api });

export default useSiteStore;
