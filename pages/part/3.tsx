import Part from 'components/page/Part';
import geomorphs from 'articles/geomorphs.md';

export default function Page() {
  return <Part part={3} markdown={{ geomorphs }} />;
}
