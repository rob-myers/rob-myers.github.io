import Main from 'components/page/Main';
import Articles from 'components/page/Articles';
import type { ArticleKey } from 'articles';
import test from 'articles/test.md';

const markdown: Partial<Record<ArticleKey, string>> = {
  test,
};

export default function TestPage() {
  return (
    <Main>
      <Articles keys={['test']} markdown={markdown} />
    </Main>
  );
}
