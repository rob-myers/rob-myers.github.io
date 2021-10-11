import Part from 'components/page/Part';

import type { ArticleKey } from 'articles';
import geomorphs from 'articles/geomorphs.md';

const markdown: Partial<Record<ArticleKey, string>> = {
  geomorphs,
};

export default function Page() {
  return <Part part={4} markdown={markdown} />;
}
