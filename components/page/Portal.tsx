import React from "react";
import * as portals from "react-reverse-portal";
import useSiteStore from "store/site.store";
import { getTabInternalId, TabMeta } from "model/tabs/tabs.model";

export default function Portal(props: Props) {
  const portalKey = getTabInternalId(props);
  const state = useSiteStore(x => portalKey in x ? x.portal[portalKey] : null);

  useEnsurePortal(props, !!state);

  return state
    ? <portals.OutPortal node={state.portal} />
    : null;
}

type Props = TabMeta;

function useEnsurePortal(
  meta: TabMeta,
  exists: boolean,
) {
  React.useEffect(() => {
    if (!exists) {
      const portalKey = getTabInternalId(meta);
      useSiteStore.setState(({ portal }) => ({
        portal: { ...portal, [portalKey]: {
          key: portalKey,
          meta,
          portal: portals.createHtmlPortalNode(),
        }},
      }));
    }
  }, []);
}