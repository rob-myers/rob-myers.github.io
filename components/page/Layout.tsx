import React from 'react';
import { Actions, Layout as FlexLayout, Model, TabNode } from 'flexlayout-react';
import { TabMeta, computeJsonModel } from 'model/tabs/tabs.model';
import useSiteStore from 'store/site.store';
import Portal from './Portal';

export default function Layout(props: Props) {
  const model = React.useMemo(
    () => Model.fromJson(computeJsonModel(props.tabs)),
    [props.tabs],
  );

  useRegisterTabs(props, model);

  return (
    <FlexLayout
      model={model}
      factory={factory}
    />
  );
}

interface Props {
  id: string;
  rootRef: React.RefObject<HTMLElement>; // TODO ?
  tabs: TabMeta[];
}

/**
 * Register <Tabs> with redux e.g. so can select tab.
 */
function useRegisterTabs(props: Props, model: Model) {
  React.useEffect(() => {
    const { tabs } = useSiteStore.getState();
    if (!props.id) {
      return console.warn('Tabs has no id', props.tabs);
    }
    // Register tabs with state
    tabs[props.id] = tabs[props.id] || {
      key: props.id,
      def: props.tabs,
      selectTab: (tabId: string) => model.doAction(Actions.selectTab(tabId)),
    };
    useSiteStore.setState({});

    return () => void delete useSiteStore.getState().tabs[props.id];
  }, [model]);
}

function factory(node: TabNode) {
  const meta = node.getConfig() as TabMeta;
  return <Portal {...meta} />;
}
