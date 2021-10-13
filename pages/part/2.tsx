import Part from 'components/page/Part';
import tech1 from 'articles/tech-1.md';
import tech2 from 'articles/tech-2.md';
import tech3 from 'articles/tech-3.md';

export default function Page() {
  return <Part
    part={2}
    markdown={{ 'tech-1': tech1, 'tech-2': tech2, 'tech-3': tech3 }}
  />;
}
