import Main from 'components/page/Main';
import Articles from 'components/page/Articles';

export default function TestPage() {
  return (
    <Main>
      <Articles keys={['test']} />
    </Main>
  );
}
