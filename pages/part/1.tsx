import Part from 'components/page/Part';
import objective from 'articles/objective.md';
import constraints from 'articles/constraints.md';
import finishing from 'articles/finishing.md';

export default function Page() {
  return <Part
    part={1}
    markdown={{ objective, constraints, finishing }}
  />;
}
