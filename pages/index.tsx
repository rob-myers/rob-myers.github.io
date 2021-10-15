import Main from 'components/page/Main';
import Articles from 'components/page/Articles';
import homepage from 'articles/homepage.md';

export default function IndexPage() {
  return (
    <Main>
      <Articles keys={["homepage"]} markdown={{ homepage }} />
    </Main>
  );
}
