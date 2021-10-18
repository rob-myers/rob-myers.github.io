import React, { useMemo } from 'react';
import * as portals from "react-reverse-portal";
import { css } from 'goober';

import * as Lookup from 'model/tabs/tabs-lookup';
import useSiteStore from "store/site.store";
import { CodeEditor } from 'components/dynamic';
import Terminal from 'components/sh/Terminal';

/**
 * TODO
 * - Used by Tabs code/component/terminal
 * - ensure hot-reloading is improved
 * - can do "modal view" of Tabs
 * - will preserve state between pages
 */
export default function Portals() {
  const lookup = useSiteStore(x => x.portal);
  const items = useMemo(() => Object.values(lookup), [lookup]);

  return items.map(({ key, meta, portal }) => {
    switch (meta.key) {
      case 'code':
        return (
          <portals.InPortal key={key} node={portal}>
            <div style={{ height: '100%', background: '#444' }}>
              <CodeEditor
                height="100%"
                lineNumbers
                readOnly
                code={Lookup.code[meta.filepath]}
                folds={meta.folds}
              />
          </div>
          </portals.InPortal>
        );
      case 'component':
        return (
          <portals.InPortal key={key} node={portal}>
            {/* TODO */}
          </portals.InPortal>
        );
      case 'terminal': {
        const env = {
          test: {}, // TODO
        };
        return (
          <portals.InPortal key={key} node={portal}>
            <Terminal sessionKey={meta.session} env={env} />;
          </portals.InPortal>
        );
      }
      default:
        return (
          <portals.InPortal key={key} node={portal}>
            <ErrorMessage>
              ⚠️ Unknown <em>TabNode</em> with name "{key}".
            </ErrorMessage>
          </portals.InPortal>
        );
    }
  });
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
