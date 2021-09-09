import Markdown from 'components/page/Markdown';
import Title from 'components/page/Title';
import Main from 'components/page/Main';

export default function IndexPage() {
  return (
    <Main>
      <Title />

      <Markdown children={`
## Coming soon...
      `}/>
    </Main>
  );
}
