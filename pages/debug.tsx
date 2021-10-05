import Main from 'components/page/Main';
import Articles from 'components/page/Articles';

export default function DraftPage() {
  return (
    <Main>
      <Articles
        keys={[
          'objective',
          'constraints',
          'technology',
          'tech-2',
          'tech-3',
          'geomorphs',
        ]}
      />
    </Main>
  );
}
