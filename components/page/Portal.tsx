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
      const htmlPortalNode = portals.createHtmlPortalNode({
        attributes: { class: 'portal' },
      });
      useSiteStore.setState(({ portal }) => ({
        portal: { ...portal, [portalKey]: {
          key: portalKey,
          meta,
          portal: htmlPortalNode,
        }},
      }));

      // If parent <Tabs/> not disabled (e.g. this is 2nd tab), wake this portal up
      const currentTabs = Object.values(useSiteStore.getState().tabs).filter(tabs => tabs.pagePathname === location.pathname);
      const parentTabs = currentTabs.find(tabs => tabs.def.some(x => x.filepath === meta.filepath));
      if (!parentTabs?.disabled) {
        setTimeout(() =>  htmlPortalNode.setPortalProps({ disabled: false }), 300);
      }

    } else if (JSON.stringify(portal.meta) !== JSON.stringify(meta)) {
      console.warn('Detected different TabMetas with same portalKey', portal.meta, meta);
    }
  }, []);
}