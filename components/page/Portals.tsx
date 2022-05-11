import React from 'react';
import { css } from 'goober';
import * as portals from "react-reverse-portal";
import { useBeforeunload } from 'react-beforeunload';

import { getCode, getComponent } from 'model/tabs/lookup';
import useSiteStore from "store/site.store";
import useSession from "store/session.store";
import { CodeEditor, Terminal } from 'components/dynamic';
import { isProfileKey, profileLookup } from 'model/sh/sh.lib';

export default function Portals() {
  const lookup = useSiteStore(site => site.portal);
  const items = React.useMemo(() => Object.values(lookup), [lookup]);

  useBeforeunload(() => {
    const sessionKeys = Object.keys(useSession.getState().session);
    sessionKeys.forEach(sessionKey => useSession.api.persist(sessionKey));
  });

  const [, setCount] = React.useState(0);
  React.useLayoutEffect(() => {
    items.forEach(async item => {
      if (item.meta.key === 'component' && !item.component) {
        const func = await getComponent(item.meta.filepath);
        item.component = func;
        setCount(x => ++x);
      }
    });
  }, [items]);
  
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
          return (
            <portals.InPortal key={key} node={portal}>
              {state.component && React.createElement(state.component)}
            </portals.InPortal>
          );
        }
        case 'terminal': {

          const env = meta.env || {};
          if (typeof env.PROFILE === 'string') {
            // Can specify profile via key
            if (isProfileKey(env.PROFILE)) env.PROFILE = profileLookup[env.PROFILE];
          } else {
            env.PROFILE = profileLookup['profile-1'];
          }

          return (
            <portals.InPortal key={key} node={portal}>
              <Terminal sessionKey={meta.filepath} env={env} />
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
