import { useRef, useEffect } from "react";
import useMeasure from "react-use-measure";
import { ArticleKey, articlesMeta } from "articles/index";
import useSiteStore from 'store/site.store';
import { Rect } from "projects/geom/rect";
import Article, { articleClassName } from "./Article";
import { lookupFromValues } from "model/generic.model";

export default function Articles({ keys }: {
  keys: ArticleKey[];
}) {
  const root = useRef<HTMLDivElement>();
  const [ref, rect] = useMeasure({ debounce: 30, scroll: true });

  useEffect(()  => {
    // Register article rects with state
    const articles = Array.from(root.current?.children || [])
      .filter(el => el.classList.contains(articleClassName))
      .map((el, i) => ({
        key: keys[i],
        rect: Rect.fromJson(el!.getBoundingClientRect()).delta(window.scrollX, window.scrollY),
      }));
    useSiteStore.setState({ articles: lookupFromValues(articles) });

    useSiteStore.api.updateArticleKey();
  }, [rect]);
  
  useEffect(() => () => {
    keys.forEach(key => delete useSiteStore.getState().articles[key]);
    useSiteStore.setState({});
  }, []);

  return (
    <div
      className="articles"
      ref={(el) => { ref(el), el && (root.current = el) }}
    >
      {keys.map(key =>
        <Article
          articleKey={key}
          dateTime={articlesMeta[key].timestamp}
          children={articlesMeta[key].markdown}
        />
      )}
    </div>
  );
  
}
