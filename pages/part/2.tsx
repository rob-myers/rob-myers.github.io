import Part from 'components/page/Part';
import technology from 'articles/technology.md';
import tech1 from 'articles/tech1.md';
import tech2 from 'articles/tech2.md';
import tech3 from 'articles/tech3.md';

export default function Page() {
  return <Part
    part={2}
    markdown={{ technology, tech1, tech2, tech3 }}
  />;
}
