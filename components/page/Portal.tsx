import React from "react";
import { createHtmlPortalNode } from "react-reverse-portal";
import useSiteStore from "store/site.store";
import { getTabInternalId, TabMeta } from "model/tabs/tabs.model";

export default function Portal(props: Props) {
  const portalKey = getTabInternalId(props);
  const portal = useSiteStore(x => portalKey in x ? x.portal[portalKey] : null);

  useEnsurePortal(props, !!portal);

  return null;
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
          portal: createHtmlPortalNode(),
        }},
      }));
    }
  }, []);
}