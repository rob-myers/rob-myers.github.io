import Main from 'components/page/Main';
import Articles from 'components/page/Articles';

export default function IndexPage() {
  return (
    <Main>
      <Articles keys={["coming-soon"]} />
    </Main>
  );
}
