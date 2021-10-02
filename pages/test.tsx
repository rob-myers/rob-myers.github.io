import Article from 'components/page/Article';
import Main from 'components/page/Main';
import testMd from 'articles/test.md';

export default function TestPage() {
  return (
    <Main>
      <Article dateTime="2021-07-19" children={testMd} />
    </Main>
  );
}
