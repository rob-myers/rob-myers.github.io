import Main from 'components/page/Main';
import Article from 'components/page/Article';

export default function IndexPage() {
  return (
    <Main>

      <Article dateTime="2021-07-19" dateText="19th July 2021" children={`
## Coming soon...
      `} />

    </Main>
  );
}
