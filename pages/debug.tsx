import Main from 'components/page/Main';
import Articles from 'components/page/Articles';

import type { ArticleKey } from 'articles';

import objective from 'articles/objective.md';
import constraints from 'articles/constraints.md';
import finishing from 'articles/finishing.md';
import technology from 'articles/constraints.md';
import tech1 from 'articles/tech2.md';
import tech2 from 'articles/tech2.md';
import tech3 from 'articles/tech3.md';
import geomorphs from 'articles/geomorphs.md';

const markdown: Partial<Record<ArticleKey, string>> = {
  objective,
  constraints,
  finishing,
  technology,
  tech1,
  tech2,
  tech3,
  geomorphs,
};

export default function DraftPage() {
  return (
    <Main>
      <Articles
        keys={[
          'objective',
          'constraints',
          'finishing',
          'technology',
          'tech1',
          'tech2',
          'tech3',
          'geomorphs',
        ]}
        markdown={markdown}
      />
    </Main>
  );
}
