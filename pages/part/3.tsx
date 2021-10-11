import Part from 'components/page/Part';

import type { ArticleKey } from 'articles';
import tech2 from 'articles/tech-2.md';
import tech3 from 'articles/tech-3.md';

const markdown: Partial<Record<ArticleKey, string>> = {
  'tech-2': tech2,
  'tech-3': tech3,
};

export default function Page() {
  return <Part part={3} markdown={markdown} />;
}
