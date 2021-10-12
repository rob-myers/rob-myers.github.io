import Main from 'components/page/Main';
import Articles from 'components/page/Articles';
import homePage from 'articles/home-page.md';

export default function IndexPage() {
  return (
    <Main>
      <Articles keys={["home-page"]} markdown={{ 'home-page': homePage }} />
    </Main>
  );
}
