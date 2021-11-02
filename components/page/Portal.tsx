import React from "react";
import * as portals from "react-reverse-portal";
import useSiteStore, { PortalState } from "store/site.store";
import { getTabInternalId, TabMeta } from "model/tabs/tabs.model";

export default function Portal(props: TabMeta) {
  const portalKey = getTabInternalId(props);
  const state = useSiteStore(
    ({ portal }) => portalKey in portal ? portal[portalKey] : null,
  );

  useEnsurePortal(props, state);

  return state
    ? <portals.OutPortal node={state.portal} />
    : null;
}

function useEnsurePortal(
  meta: TabMeta,
  portal: PortalState | null,
) {
  React.useEffect(() => {
    if (!portal) {
      const portalKey = getTabInternalId(meta);
      useSiteStore.setState(({ portal }) => ({
        portal: { ...portal, [portalKey]: {
          key: portalKey,
          meta,
          portal: portals.createHtmlPortalNode({
            attributes: { class: 'portal' }
          }),
        }},
      }));
    } else if (JSON.stringify(portal.meta) !== JSON.stringify(meta)) {
      console.warn('Detected different TabMetas with same portalKey', portal.meta, meta);
    }
  }, []);
}