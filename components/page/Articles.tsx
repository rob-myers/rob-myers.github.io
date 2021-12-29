import React from "react";
// Tried react-sizeme but initial anchor didn't work 
import useMeasure from "react-use-measure";
import { css } from "goober";

import { lookupFromValues } from "model/generic.model";
import { ArticleKey, articlesMeta } from "articles/index";
import useSiteStore from 'store/site.store';
import { Rect } from "projects/geom/rect";

import Article from "./Article";

export default function Articles({ keys, markdown }: Props) {
  const root = React.useRef<HTMLUListElement>();
  const [ref, rect] = useMeasure({ debounce: 30, scroll: false });

  React.useEffect(()  => {// Register article rects with state
    const articles = Array.from(root.current?.children || [])
      .map((el, i) => ({
        key: keys[i],
        rect: Rect.fromJson(el!.getBoundingClientRect()).delta(window.scrollX, window.scrollY),
      }));
    useSiteStore.setState({ articles: lookupFromValues(articles) });
    useSiteStore.api.updateArticleKey();
  }, [rect]);
  
  React.useEffect(() => () => {// Unregister articles
    keys.forEach(key => delete useSiteStore.getState().articles[key]);
    useSiteStore.setState({});
  }, []);

  return (
    <ol
      className={rootCss}
      ref={(el) => { ref(el), el && (root.current = el) }}
    >
      {keys.map(key =>
        <li key={key}>
          <Article
            articleKey={key}
            dateTime={articlesMeta[key].timestamp}
            children={markdown[key] || ''}
            tags={articlesMeta[key].tags as any}
          />
        </li>
      )}
    </ol>
  );
}

interface Props {
  keys: ArticleKey[];
  markdown: Partial<Record<ArticleKey, string>>;
}

const rootCss = css`
  padding: 0;
  margin: 0;
  list-style: none;
`;
