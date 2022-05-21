import { last } from 'projects/service/generic';
import { ArticleKey, navGroups, articlesMeta } from 'articles/index';
import Main from './Main';
import Articles from './Articles';
import NextArticle from './NextArticle';

export default function Part({ part, markdown }: {
  part: number;
  markdown: Partial<Record<ArticleKey, string>>;
}) {
  const keys = navGroups[part].map(x => x.key);

  const lastArticle = keys.length ? articlesMeta[last(keys)!] : null;
  const nextArticle = lastArticle?.next ? articlesMeta[lastArticle.next] : null;

  return (
    <Main>
      <Articles
        keys={keys}
        markdown={markdown}
      />
      <NextArticle
        article={nextArticle}
      />
    </Main>
  );
}
