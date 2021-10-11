import Main from 'components/page/Main';
import Articles from 'components/page/Articles';

export default function Part() {
  return (
    <Main>
      <Articles keys={[
        'tech-1',
        'tech-2',
        'tech-3',
      ]} />
    </Main>
  );
}
