import Article from 'components/page/Article';
import Main from 'components/page/Main';

export default function TestPage() {
  return (
    <Main>

      <Article dateTime="2021-07-19" dateText="19th July 2021">
        {`

## Test page

<div
    className="tabs"
    enabled="true"
    height="600"
    tabs="[
      { key: 'component', filepath: 'geomorph/GeomorphDemo' },
      // { key: 'terminal', session: 'test' },
      // { key: 'terminal', session: 'other' },
    ]"
>
</div>

        `}
      </Article>
    </Main>
  );
}
