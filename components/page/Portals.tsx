import React from 'react';
import * as portals from "react-reverse-portal";
import { css } from 'goober';

import { getCode, getComponent } from 'model/tabs/lookup';
import useSiteStore from "store/site.store";
import { CodeEditor, Terminal } from 'components/dynamic';

export default function Portals() {
  const lookup = useSiteStore(site => site.portal);
  const items = React.useMemo(() => Object.values(lookup), [lookup]);

  return <>
    {items.map((state) => {
      const { key, meta, portal } = state;
      switch (meta.key) {
        case 'code':
          return (
            <portals.InPortal key={key} node={portal}>
              <div style={{ height: '100%', background: '#444' }}>
                <CodeEditor
                  height="100%"
                  lineNumbers
                  readOnly
                  code={getCode(meta.filepath)}
                  folds={meta.folds}
                />
              </div>
            </portals.InPortal>
          );
        case 'component': {
          const [component, setComponent] = React.useState<() => JSX.Element>();

          React.useEffect(() => {
            // setState(() => func) avoids setState(prev => next)
            getComponent(meta.filepath).then(func => setComponent(() => func as any));
          }, []);

          return (
            <portals.InPortal key={key} node={portal}>
              {component && React.createElement(component)}
            </portals.InPortal>
          );
        }
        case 'terminal': {
          const defaultEnv: React.ComponentProps<typeof Terminal>['env'] = {
            README: 'No environment was provided to this terminal.',
          };
          return (
            <portals.InPortal key={key} node={portal}>
              <Terminal sessionKey={meta.filepath} env={meta.env || defaultEnv} />
            </portals.InPortal>
          );
        }
        default:
          return (
            <portals.InPortal key={key} node={portal}>
              <ErrorMessage>
                ⚠️ Unknown Tab with key "{key}".
              </ErrorMessage>
            </portals.InPortal>
          );
      }
    })}
  </>
}

function ErrorMessage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className={errorCss}>
      <strong>{children}</strong>
    </div>
  );
}

const errorCss = css`
  margin: 24px;
  color: red;
  font-size: 1.2rem;
  font-family: monospace;
`;
