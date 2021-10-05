import Main from 'components/page/Main';
import Articles from 'components/page/Articles';

export default function GeomorphsPage() {
  return (
    <Main>
      <Articles keys={['geomorphs']} />
    </Main>
  );
}
