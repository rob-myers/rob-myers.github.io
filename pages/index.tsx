import Main from 'components/page/Main';
import Articles from 'components/page/Articles';
import frontpage from 'articles/frontpage.md';

export default function IndexPage() {
  return (
    <Main>
      <Articles keys={["frontpage"]} markdown={{ frontpage }} />
    </Main>
  );
}
