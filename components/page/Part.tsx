import { ArticleKey, navGroups } from 'articles';
import Main from 'components/page/Main';
import Articles from 'components/page/Articles';

export default function Part({ part, markdown }: {
  part: number;
  markdown: Partial<Record<ArticleKey, string>>;
}) {
  const keys = navGroups[part].map(x => x.key);

  return (
    <Main>
      <Articles keys={keys} markdown={markdown} />
    </Main>
  );
}
