import Markdown from 'components/page/Markdown';

export default function IndexPage() {
  return (
    <div className="main">
      <section>

        <Markdown title children={`
# Rogue Markup

Roguelike; Built online; Game AI focus
        `}/>

        <Markdown children={`
## Coming soon
        `}/>

      </section>

    </div>
  );
}
