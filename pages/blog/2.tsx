import Main from 'components/page/Main';
import Articles from 'components/page/Articles';

export default function TechnologyPage() {
  return (
    <Main>
      <Articles keys={['technology', 'tech-2', 'tech-3']} />
    </Main>
  );
}
