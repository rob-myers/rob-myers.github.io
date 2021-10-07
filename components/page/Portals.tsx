import React from 'react';
import useSiteStore from "store/site.store";

/**
 * TODO
 * - Subscribe to Tabs state and use portals.
 * - We are doing this to permit hot-reloading i.e. avoid remount Tabs
 * - We might also use it to provide "modal view" of Tabs
 */
export default function Portals() {
  const tabs = useSiteStore(
    x => Object.values(x.tabs),
    // Registered Tabs on page should increase monotonically
    (a, b) => a.length === b.length,
  );

  // TODO

  return null;
}