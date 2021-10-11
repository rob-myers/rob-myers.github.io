import Main from 'components/page/Main';
import Articles from 'components/page/Articles';

import type { ArticleKey } from 'articles';
import comingSoon from 'articles/coming-soon.md';

const markdown: Partial<Record<ArticleKey, string>> = {
  "coming-soon": comingSoon,
};

export default function IndexPage() {
  return (
    <Main>
      <Articles keys={["coming-soon"]} markdown={markdown} />
    </Main>
  );
}
