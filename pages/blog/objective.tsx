import Main from 'components/page/Main';
import Article from 'components/page/Article';

import objectiveMd from 'articles/objective.md';
import constraintsMd from 'articles/constraints.md';

export default function ObjectivePage() {
  return (
    <Main>

      <Article
        dateTime="2021-07-19"
        children={objectiveMd}
      />

      <Article
        dateTime="2021-07-19"
        children={constraintsMd}
      />

    </Main>
  );
}
