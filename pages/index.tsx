import Markdown from 'components/page/Markdown';
import Title from 'components/page/Title';

export default function IndexPage() {
  return (
    <main>
      <section>

        <Title />

        <Markdown children={`
## Coming soon
        `}/>

      </section>
    </main>
  );
}
