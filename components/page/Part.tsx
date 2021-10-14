import { last } from 'model/generic.model';
import { ArticleKey, navGroups, articlesMeta } from 'articles/index';
import Main from './Main';
import Articles from './Articles';
import Next from "./Next";

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
      <Next article={nextArticle} />
    </Main>
  );
}
