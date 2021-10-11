import Part from 'components/page/Part';

import type { ArticleKey } from 'articles';
import techPt2 from 'articles/tech-pt2.md';
import techPt3 from 'articles/tech-pt3.md';

const markdown: Partial<Record<ArticleKey, string>> = {
  'tech-2': techPt2,
  'tech-3': techPt3,
};

export default function Page() {
  return <Part part={3} markdown={markdown} />;
}
