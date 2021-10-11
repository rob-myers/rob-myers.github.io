import Main from 'components/page/Main';
import Articles from 'components/page/Articles';

import type { ArticleKey } from 'articles';

import objective from 'articles/objective.md';
import constraints from 'articles/constraints.md';
import technology from 'articles/constraints.md';
import techPart2 from 'articles/tech-2.md';
import techPart3 from 'articles/tech-3.md';
import geomorphs from 'articles/geomorphs.md';

const markdown: Partial<Record<ArticleKey, string>> = {
  objective,
  constraints,
  technology,
  'tech-2': techPart2,
  'tech-3': techPart3,
  geomorphs,
};

export default function DraftPage() {
  return (
    <Main>
      <Articles
        keys={[
          'objective',
          'constraints',
          'technology',
          'tech-2',
          'tech-3',
          'geomorphs',
        ]}
        markdown={markdown}
      />
    </Main>
  );
}
