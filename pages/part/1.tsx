import Main from 'components/page/Main';
import Articles from 'components/page/Articles';

export default function Part() {
  return (
    <Main>
      <Articles keys={[
        'objective',
        'constraints',
        'technology',
      ]} />
    </Main>
  );
}
