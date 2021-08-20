import styled from '@emotion/styled';
import * as Lookup from 'model/tabs-lookup';

export type TabMeta = (
  | { key: 'code'; filepath: Lookup.CodeFilepathKey; folds?: CodeMirror.Position[] }
  | { key: 'component'; filepath: Lookup.ComponentFilepathKey }
);

export function Tab({ children }: React.PropsWithChildren<{}>) {
  return (
    <TabRoot>
      {children}
    </TabRoot>
  );
}

const TabRoot = styled.section`
  height: 100%;
  width: 100%;
`;

export function ErrorMessage({ children }: React.PropsWithChildren<{}>) {
  return (
    <section>
      <strong>{children}</strong>
    </section>
  );
}
