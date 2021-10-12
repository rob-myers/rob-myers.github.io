import Main from 'components/page/Main';
import Articles from 'components/page/Articles';
import test from 'articles/test.md';

export default function TestPage() {
  return (
    <Main>
      <Articles keys={['test']} markdown={{ test }} />
    </Main>
  );
}
