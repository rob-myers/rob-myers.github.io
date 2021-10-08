import { useRef, useEffect } from "react";
import { ArticleKey, articlesMeta } from "articles/index";
import useSiteStore from 'store/site.store';
import { Rect } from "projects/geom/rect";
import Article, { articleClassName } from "./Article";
import { lookupFromValues } from "model/generic.model";

export default function Articles({ keys }: {
  keys: ArticleKey[];
}) {
  const root = useRef<HTMLDivElement>(null);

  // Register articles and anchors with state
  useEffect(()  => {
    const onResize = () => {
      const articles = Array.from(root.current?.children || [])
        .filter(el => el.classList.contains(articleClassName));

      const anchors = articles.flatMap(x => [x].concat(Array.from(x.children)))
        .filter(el => el.id);
      
      console.log(anchors);

      useSiteStore.setState({
        articles: lookupFromValues(articles.map((el, i) => ({
          key: keys[i],
          rect: Rect.fromJson(el!.getBoundingClientRect()).delta(window.scrollX, window.scrollY),
        }))),
      });
      useSiteStore.api.updateArticleKey();
    };

    window.addEventListener('resize', onResize), onResize();

    return () => {
      window.removeEventListener('resize', onResize);
      keys.forEach(key => delete useSiteStore.getState().articles[key]);
      useSiteStore.setState({});
    };
  }, []);

  return (
    <div className="articles" ref={root}>
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
