import React from "react";
import useSiteStore from "store/site.store";
import { TabMeta } from "./TabsAux";

export default function Portal(props: Props) {
  const portal = useSiteStore(x => x.portal[props.])

  React.useEffect(() => {
    // Request portal
  }, []);


  return null;
}

type Props = TabMeta;