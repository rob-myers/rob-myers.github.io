import Main from 'components/page/Main';
import Article from 'components/page/Article';

import technologyMd from 'articles/technology.md';
import techPt2Md from 'articles/tech-pt2.md';
import techPt3Md from 'articles/tech-pt3.md';

export default function TechnologyPage() {
  return (
    <Main>

      <Article
        dateTime="2021-07-19"
        children={technologyMd}
      />

      <Article
        dateTime="2021-07-19"
        children={techPt2Md}
      />

      <Article
        dateTime="2021-07-19"
        children={techPt3Md}
      />

    </Main>
  );
}
