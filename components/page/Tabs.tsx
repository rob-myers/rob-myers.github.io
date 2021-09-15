import React from 'react';
import { css } from 'goober';
import {Layout, Model, TabNode, IJsonModel} from 'flexlayout-react';
import classNames from 'classnames';

import useSiteStore from 'store/site.store';
import { computeJsonModel,  factory,  LoadingOverlay, TabMeta } from './TabsAux';

export default function Tabs({ tabs, height, storeKey }: Props) {
  const model = React.useMemo(() => Model.fromJson(computeJsonModel(tabs)), [tabs]);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [fade, setFade] = React.useState(false);

  React.useEffect(() => {
    setFade(true);
    if (storeKey) {
      useSiteStore.getState().tabs[storeKey] = {
        key: storeKey,
        model,
        scrollIntoView: () => rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      };
      return () => void delete useSiteStore.getState().tabs[storeKey];
    }
  }, [model]);


  return (
    <div
      className={classNames("tabs", "scrollable", rootCss(height))}
      ref={rootRef}
    >
      <div className={overlayContainerCss(height)}>
        <LoadingOverlay fade={fade} />
        {fade && <Layout model={model} factory={factory} />}
      </div>
    </div>
  );
}

interface Props {
  storeKey?: string;
  height: number;
  tabs: TabMeta[];
}

const rootCss = (height: number) => css`
  margin: 40px 0;
  @media(max-width: 600px) {
    margin: 0;
  }

  > .flexlayout__layout {
    background: #444;
    position: relative;
    height: ${height}px;
  }
  .flexlayout__tab {
    /* border: 1px solid rgba(0, 0, 0, 0.3); */
    border-top: 6px solid #444;
    position: relative;
    /** Handle svg overflow */
    overflow: hidden;
  }
  .flexlayout__tabset_tabbar_outer {
    background: #222;
    border-bottom: 1px solid #555;
  }
  .flexlayout__tab_button--selected, .flexlayout__tab_button:hover {
    background: #444;
  }
  .flexlayout__tab_button_content {
    user-select: none;
    font-size: 13px;
    color: #aaa;
  }
  .flexlayout__tab_button--selected .flexlayout__tab_button_content {
    color: #fff;
  }
  .flexlayout__tab_button:hover:not(.flexlayout__tab_button--selected) .flexlayout__tab_button_content {
    color: #ddd;
  }
  .flexlayout__splitter_vert, .flexlayout__splitter_horz {
    background: #827575;
  }
`;

const overlayContainerCss = (height: number) => css`
  width: 100%;
  height: ${height}px;
  position: relative;
`;