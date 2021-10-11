import Part from 'components/page/Part';

import type { ArticleKey } from 'articles';
import technology from 'articles/technology.md';
import tech1 from 'articles/tech-1.md';

const markdown: Partial<Record<ArticleKey, string>> = {
  technology,
  'tech-1': tech1,
};

export default function Page() {
  return <Part part={2} markdown={markdown} />;
}
