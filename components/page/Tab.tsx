import styled from '@emotion/styled';
import * as Lookup from 'model/tabs-lookup';

export type TabMeta = (
  | { key: 'code'; filepath: Lookup.CodeFilepathKey; folds?: CodeMirror.Position[] }
  | { key: 'component'; filepath: Lookup.ComponentFilepathKey }
);

export function Tab({ children }: React.PropsWithChildren<{}>) {
  return (
    <TabRoot>
      <TabToolbar />
      <div className="tab-content">{children}</div>
    </TabRoot>
  );
}

const TabRoot = styled('section')`
  height: 100%;
  font-size: 14px;
  position: relative;

  .tab-toolbar {
    background: #444;
    color: white;
    position: absolute;
    top: 0;
    width: 100%;
    height: 16px;
    /* padding: 6px 8px; */
  }

  .tab-content {
    position: absolute;
    top: 16px;
    width: 100%;
    height: calc(100% - 16px);
  }
`;

function TabToolbar() {
  return <div className="tab-toolbar" />;
}

export function ErrorMessage({ children }: React.PropsWithChildren<{}>) {
  return <section><strong>{children}</strong></section>;
}
