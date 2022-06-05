import Router from 'next/router';
import React from 'react';
import { Actions, IJsonModel, Layout as FlexLayout, Model, Node, TabNode } from 'flexlayout-react';
import { useBeforeunload } from 'react-beforeunload';

import { tryLocalStorageGet, tryLocalStorageSet } from 'projects/service/generic';
import { TabMeta, computeJsonModel, getTabName } from 'model/tabs/tabs.model';
import { scrollFinished } from 'model/dom.model';
import useSiteStore from 'store/site.store';
import type { Props as TabsProps } from './Tabs';
import Portal from './Portal';

export default function Layout(props: Props) {

  const model = React.useMemo(() => {

    const output = restoreJsonModel(props);

    output.visitNodes((node) => {
      if (node.getType() === 'tab') {
        node.setEventListener('visibility', () => {
          /**
           * - Disable if tab becomes invisible.
           * - Enable if tab becomes visible and parent Tabs enabled.
           */
          setTimeout(() => {
            const [key, visible] = [node.getId(), node.isVisible()];
            const portal = useSiteStore.getState().portal[key];
            const tabs = Object.values(useSiteStore.getState().tabs)
              .find(x => x.def.some(y => y.filepath === portal?.key));
            if (portal && tabs) {
              // console.log(key, visible, tabs);
              portal.portal.setPortalProps({ disabled: !visible || tabs.disabled });
            }
          });
        });
      }
    });

    return output;
  }, [JSON.stringify(props.tabs)],
  );
  
  useRegisterTabs(props, model);

  return (
    <FlexLayout
      model={model}
      factory={factory}
      realtimeResize
    />
  );
}

interface Props extends Pick<TabsProps, 'tabs'> {
  id: string;
  readonly initEnabled: boolean;
}

/**
 * Register Tabs (collectively, not individual tabs) with redux
 * e.g. so can select a particular tab programmatically.
 */
function useRegisterTabs(props: Props, model: Model) {
  React.useEffect(() => {
    const { tabs } = useSiteStore.getState();
    if (!props.id) {
      return console.warn('Tabs has no id', props.tabs);
    }

    if (!tabs[props.id]) {
      // Register tabs with state
      tabs[props.id] = {
        key: props.id,
        def: props.tabs[0].concat(props.tabs[1]),
        selectTab: (tabId: string) =>
          model.doAction(Actions.selectTab(tabId)),
        scrollTo: async () => {
          const id = props.id;
          const { top } = document.getElementById(id)!.getBoundingClientRect();
          window.scrollBy({ top, behavior: 'smooth' });
          if (! await scrollFinished(window.pageYOffset + top)) return;
          Router.push(`#${id}`);
        },
        getTabNodes: () => {
          const output = [] as TabNode[];
          model.visitNodes(x => x instanceof TabNode && output.push(x));
          return output;
        },
        disabled: !props.initEnabled,
        pagePathname: location.pathname,
      };
    }
    useSiteStore.setState({});

    return () => void delete useSiteStore.getState().tabs[props.id];
  }, [model]);

  useBeforeunload(() => {
    tryLocalStorageSet(`model@${props.id}`, JSON.stringify(model.toJson()));
  });
}

function factory(node: TabNode) {
  const meta = node.getConfig() as TabMeta;
  return <Portal {...meta} />;
}

function restoreJsonModel(props: Props) {
  const jsonModelString = tryLocalStorageGet(`model@${props.id}`);

  if (jsonModelString) {
    try {
      const jsonModel = JSON.parse(jsonModelString) as IJsonModel;
      const model = Model.fromJson(jsonModel);
      
      // Validate i.e. props.tabs must mention same ids
      const prevTabNodes = [] as Node[];
      model.visitNodes(node => node.getType() === 'tab' && prevTabNodes.push(node));
      const nextTabNodeIds = props.tabs[0].concat(props.tabs[1]).map(getTabName)

      if (!(
        prevTabNodes.length === nextTabNodeIds.length
        && prevTabNodes.every(node => nextTabNodeIds.includes(node.getId()))
      )) {
        throw Error(`restoreJsonModel: prev/next ids differ ${
          JSON.stringify(prevTabNodes.map(x => x.getId()))
        } versus ${JSON.stringify(nextTabNodeIds)}`);
      }
      
      // Overwrite metas to avoid stale data
      const allMetas = props.tabs[0].concat(props.tabs[1]);
      model.visitNodes(node => {
        if (node.getType() === 'tab') {
          (node as any)._attributes.config = allMetas.find(meta => getTabName(meta) === node.getId());
        }
      });
      
      return model;

    } catch (e) {
      console.error(e);
    }
  }
  return Model.fromJson(computeJsonModel(props.tabs));
}