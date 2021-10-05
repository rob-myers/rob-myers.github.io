import Main from 'components/page/Main';
import Articles from 'components/page/Articles';

export default function Page1() {
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
