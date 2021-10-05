import { useRef, useEffect } from "react";
import { ArticleKey, articlesMeta } from "articles";
import useSiteStore from 'store/site.store';
import { Rect } from "projects/geom";
import Article, { articleClassName } from "./Article";

export default function Articles({ keys }: {
  keys: ArticleKey[];
}) {

  // Register articles with state
  const root = useRef<HTMLDivElement>(null);
  useEffect(()  => {
    const onResize = () => {
      Array.from(root.current!.children)
        .filter(el => el.classList.contains(articleClassName))
        .forEach((el, i) => useSiteStore.getState().articles[keys[i]] = {
          key: keys[i],
          rect: Rect.fromJson(el!.getBoundingClientRect())
            .delta(window.scrollX, window.scrollY),
        });
      useSiteStore.setState({});
    };
    window.addEventListener('resize', onResize), onResize();
    useSiteStore.api.updateArticleKey();
    return () => {
      window.removeEventListener('resize', onResize);
      keys.forEach(key => delete useSiteStore.getState().articles[key]);
    };
  }, []);

  return (
    <div ref={root}>
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
