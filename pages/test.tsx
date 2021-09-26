import Article from 'components/page/Article';
import Main from 'components/page/Main';
import Markdown from 'components/page/Markdown';
import Tabs from 'components/page/Tabs';

export default function TestPage() {
  return (
    <Main>

      <Article dateTime="2021-07-19" dateText="19th July 2021">
        <Markdown children={`
## Test page
        `}/>

        <Tabs
        enabled
          height={400}
          tabs={[
            { key: 'component', filepath: 'geomorph/GeomorphDemo.jsx' },
            // { key: 'terminal', session: 'test' },
            // { key: 'terminal', session: 'other' },
          ]}
        />

        <Markdown children={`
...

        `}/>
      </Article>
    </Main>
  );
}
