import { styled } from 'goober';
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

const TabRoot = styled('div')`
  height: 100%;
  width: 100%;
  border-top: 6px solid #444;
`;

export function ErrorMessage({ children }: React.PropsWithChildren<{}>) {
  return (
    <section>
      <strong>{children}</strong>
    </section>
  );
}
