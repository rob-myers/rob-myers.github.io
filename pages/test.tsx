import Main from 'components/page/Main';
import Title from 'components/page/Title';
import Markdown from 'components/page/Markdown';
import Tabs from 'components/page/Tabs';

export default function TestPage() {
  return (
    <Main>
      <Title />

      <Markdown children={`
---

## Test page <float rem="1.2">19th July 2021</float>

        `}/>

      <Tabs
        height={400}
        tabs={[
          { key: 'terminal', session: 'test' },
          { key: 'terminal', session: 'other' },
        ]}
      />

    </Main>
  );
}
