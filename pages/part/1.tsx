import Part from 'components/page/Part';
import type { ArticleKey } from 'articles';
import objective from 'articles/objective.md';
import constraints from 'articles/constraints.md';

const markdown: Partial<Record<ArticleKey, string>> = {
  objective,
  constraints,
};

export default function Page() {
  return <Part part={1} markdown={markdown} />;
}
