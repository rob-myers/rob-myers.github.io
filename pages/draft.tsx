import Main from 'components/page/Main';
import Article from 'components/page/Article';

import objectiveMd from 'articles/objective.md';
import constraintsMd from 'articles/constraints.md';
import technologyMd from 'articles/technology.md';
import techPt2Md from 'articles/techPt2.md';
import techPt3Md from 'articles/techPt3.md';
import geomorphsMd from 'articles/geomorphs.md';

export default function DraftPage() {
  return (
    <Main>

      <Article
        dateTime="2021-07-19"
        dateText="19th July 2021"
        children={objectiveMd}
      />

      <Article
        dateTime="2021-07-19"
        dateText="19th July 2021"
        children={constraintsMd}
      />

      <Article
        dateTime="2021-07-19"
        dateText="19th July 2021"
        children={technologyMd}
      />

      <Article
        dateTime="2021-07-19"
        dateText="19th July 2021"
        children={techPt2Md}
      />

      <Article
        dateTime="2021-07-19"
        dateText="19th July 2021"
        children={techPt3Md}
      />

      <Article
        dateTime="2021-07-19"
        dateText="19th July 2021"
        children={geomorphsMd}
      />

    </Main>
  );
}
