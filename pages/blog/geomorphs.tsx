import Main from 'components/page/Main';
import Article from 'components/page/Article';

import geomorphsMd from 'articles/geomorphs.md';

export default function GeomorphsPage() {
  return (
    <Main>

      <Article
        dateTime="2021-07-19"
        children={geomorphsMd}
      />

    </Main>
  );
}
