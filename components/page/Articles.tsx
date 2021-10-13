import { useRef, useEffect } from "react";
import useMeasure from "react-use-measure";
import { css } from "goober";

import { lookupFromValues } from "model/generic.model";
import { ArticleKey, articlesMeta, getArticleHref } from "articles/index";
import useSiteStore from 'store/site.store';
import { Rect } from "projects/geom/rect";
import Article, { articleClassName } from "./Article";
import Link from "./Link";

export default function Articles({ keys, markdown }: Props) {
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
          children={markdown[key] || ''}
        />
      )}
      <NextArticle />
    </div>
  );
  
}

interface Props {
  keys: ArticleKey[];
  markdown: Partial<Record<ArticleKey, string>>;
}

function NextArticle() {
  const article = useSiteStore(x => x.articleKey ? articlesMeta[x.articleKey] : null);
  const href = article?.next ? getArticleHref(articlesMeta[article.next]) : '';
  return (
    <section className={nextArticleCss}>
      <Link href={href} forward>
        Next article
      </Link>
    </section>
  );
}

const nextArticleCss = css`
  margin-top: -32px;
  font-size: 1.1rem;
  cursor: pointer;
  background: #666;

  height: 64px;
  display: flex;

  a {
    color: white;
    width: 100%;
    height: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`;
