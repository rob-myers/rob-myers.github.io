import { css } from 'goober';
import * as Lookup from 'model/tabs-lookup';

export default function Tab({ children }:  React.PropsWithChildren<{}>) {
  return (
    <div className={rootCss}>
      {children}
    </div>
  );
}

const rootCss = css`
  height: 100%;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-top: 6px solid #444;
`;

export type TabMeta = (
  | { key: 'code'; filepath: Lookup.CodeFilepathKey; folds?: CodeMirror.Position[] }
  | { key: 'component'; filepath: Lookup.ComponentFilepathKey }
);

export function ErrorMessage({ children }: React.PropsWithChildren<{}>) {
  return (
    <section>
      <strong>{children}</strong>
    </section>
  );
}
