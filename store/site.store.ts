import create from 'zustand';
import { devtools } from 'zustand/middleware';
import type { HtmlPortalNode } from 'react-reverse-portal';
import type { TabNode } from 'flexlayout-react';
import { Subject } from 'rxjs';

import { KeyedLookup, last } from 'model/generic.model';
import type { TabMeta } from 'model/tabs/tabs.model';
import type { ArticleKey } from 'articles/index';

export type State = {
  /** Key of currently viewed article */
  articleKey: null | ArticleKey;
  /** <Article>s on current page */
  articles: KeyedLookup<ArticleState>;
  /** Site-wide portals, corresponding to individual tabs */
  portal: KeyedLookup<PortalState>;
  /** Stage lookup */
  stage: KeyedLookup<Stage>;
  /** <Tabs> on current page */
  tabs: KeyedLookup<TabsState>;

  readonly api: {
    ensureStage: (stageKey: string) => void;
    updateArticleKey: () => void;
  };
};

const useStore = create<State>(devtools((set, get) => ({
  articleKey: null,
  articles: {},
  portal: {},
  stage: {},
  tabs: {},

  api: {
    ensureStage: (stageKey: string) => {
      const { stage } = get();
      const output = stage[stageKey] || (
        stage[stageKey] = {
          key: stageKey,
          keyEvent: new Subject,
          ptrEvent: new Subject,
        }
      );
      set({});
      return output;
    },
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

interface Stage {
  key: string;
  /** Keyboard events sent by `Stage` */
  keyEvent: Subject<StageKeyEvent>;
  /** Mouse events sent by `Stage` */
  ptrEvent: Subject<StagePointerEvent>;
}

type StageKeyEvent = Pick<KeyboardEvent, (
  | 'key'
  | 'metaKey'
  | 'shiftKey'
  | 'type'
)> & {
  type: 'keydown' | 'keyup';
};

type StagePointerEvent = {
  /** Position on ground */
  point: Geom.VectJson;
} & (
  | { key: 'pointerdown' }
  | { key: 'pointerup' }
  | { key: 'pointerleave' }
  | { key: 'pointermove' }
);

const api = useStore.getState().api;
const useSiteStore = Object.assign(useStore, { api });

export default useSiteStore;
