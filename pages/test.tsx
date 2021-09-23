import Article from 'components/page/Article';
import Main from 'components/page/Main';
import Markdown from 'components/page/Markdown';
import Tabs from 'components/page/Tabs';

export default function TestPage() {
  return (
    <Main>

      <Article dateTime="2021-07-19" dateText="19th July 2021">
        <Markdown className="bot-sm" children={`
## Test page
        `}/>

        <Tabs
          height={400}
          tabs={[
            { key: 'terminal', session: 'test' },
            { key: 'terminal', session: 'other' },
          ]}
        />

        <Markdown className="top-sm" children={`
...

        `}/>
      </Article>
    </Main>
  );
}
