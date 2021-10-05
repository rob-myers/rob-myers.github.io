import { useRef, useEffect } from "react";
import { ArticleKey, articlesMeta } from "articles";
import useSiteStore from 'store/site.store';
import Article, { articleClassName } from "./Article";

export default function Articles({ keys }: {
  keys: ArticleKey[];
}) {

  // Register articles with state
  const root = useRef<HTMLDivElement>(null);
  useEffect(()  => {
    const resize = () => {
      Array.from(root.current!.children).filter(el => el.classList.contains(articleClassName))
        .forEach((el, i) => useSiteStore.getState().articles[keys[i]] = {
          key: keys[i],
          rect: el!.getBoundingClientRect(),
        });
      useSiteStore.setState({});
    };
    window.addEventListener('resize', resize), resize();
    useSiteStore.api.updateArticleKey(0);
    return () => {
      window.removeEventListener('resize', resize);
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
