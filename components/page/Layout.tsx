import React from 'react';
import { Actions, Layout as FlexLayout, Model } from 'flexlayout-react';
import useSiteStore from 'store/site.store';
import { computeJsonModel, factory, TabMeta } from './TabsAux';

export default function Layout(props: Props) {
  const model = React.useMemo(() => Model.fromJson(computeJsonModel(props.tabs)), [props.tabs]);

  React.useEffect(() => {
    if (props.storeKey) {
      useSiteStore.getState().tabs[props.storeKey] = {
        key: props.storeKey,
        selectTab: (tabId: string) => model.doAction(Actions.selectTab(tabId)),
        scrollIntoView: () => props.rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      };
      return () => void delete useSiteStore.getState().tabs[props.storeKey || ''];
    }
  }, [model]);

  return <FlexLayout model={model} factory={factory} />
}

interface Props {
  storeKey?: string;
  rootRef: React.RefObject<HTMLElement>; // TODO ?
  tabs: TabMeta[];
}
