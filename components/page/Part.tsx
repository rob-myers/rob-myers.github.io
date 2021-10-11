import { navGroups } from 'articles';
import Main from 'components/page/Main';
import Articles from 'components/page/Articles';

export default function Part({ part }: {
  part: number;
}) {
  const keys = navGroups[part].map(x => x.key);

  return (
    <Main>
      <Articles keys={keys} />
    </Main>
  );
}
