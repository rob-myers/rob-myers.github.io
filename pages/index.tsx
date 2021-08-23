import { Section, Main } from 'components/page/Layout';
import Markdown from 'components/page/Markdown';

export default function IndexPage() {
  return (
    <Main>
      <Section>

        <Markdown title children={`
# Rogue Markup

Roguelike; Built online; Game AI focus
        `}/>

        <Markdown children={`
## Coming soon
        `}/>

      </Section>

    </Main>
  );
}
