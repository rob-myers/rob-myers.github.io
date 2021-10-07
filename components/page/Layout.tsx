import React from 'react';
import { Actions, Layout as FlexLayout, Model } from 'flexlayout-react';
import * as portals from 'react-reverse-portal';
import useSiteStore from 'store/site.store';
import { computeJsonModel, factory, TabMeta } from './TabsAux';

export default function Layout(props: Props) {
  const model = React.useMemo(() => Model.fromJson(computeJsonModel(props.tabs)), [props.tabs]);

  React.useEffect(() => {
    const { tabs } = useSiteStore.getState();
    if (!props.storeKey) {
      return console.warn('Tabs has no storeKey', props.tabs);
    }
    // Register tabs with state
    tabs[props.storeKey] = tabs[props.storeKey] || {
      key: props.storeKey,
      def: props.tabs,
      portal: portals.createHtmlPortalNode(),
      selectTab: (tabId: string) => model.doAction(Actions.selectTab(tabId)),
      scrollIntoView: () => props.rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    };
    useSiteStore.setState({});
    return () => void delete useSiteStore.getState().tabs[props.storeKey];
  }, [model]);

  return <FlexLayout model={model} factory={factory} />
}

interface Props {
  storeKey: string;
  rootRef: React.RefObject<HTMLElement>; // TODO ?
  tabs: TabMeta[];
}
