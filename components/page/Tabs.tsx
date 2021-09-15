import React from 'react';
import { css } from 'goober';
import { Layout, Model, Actions } from 'flexlayout-react';
import classNames from 'classnames';

import useSiteStore from 'store/site.store';
import { computeJsonModel, factory, TabMeta } from './TabsAux';
import { ControlsOverlay, LoadingOverlay } from './TabsOverlay';

export default function Tabs({ tabs, height, storeKey }: Props) {
  const model = React.useMemo(() => Model.fromJson(computeJsonModel(tabs)), [tabs]);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (storeKey) {
      useSiteStore.getState().tabs[storeKey] = {
        key: storeKey,
        selectTab: (tabKey: string) => model.doAction(Actions.selectTab(tabKey)),
        scrollIntoView: () => rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      };
      return () => void delete useSiteStore.getState().tabs[storeKey];
    }
  }, [model]);

  const [colour, setColour] = React.useState('black' as 'black' | 'faded' | 'clear');
  const [enabled, setEnabled] = React.useState(true);
  React.useEffect(() => void setColour('clear'), []);

  return (
    <div
      ref={rootRef}
      className={classNames("tabs", "scrollable", rootCss(height))}
    >
      <div className={overlayCss(height)}>
        {colour !== 'black' && <Layout model={model} factory={factory} />}
        <ControlsOverlay enabled={enabled} toggleEnabled={() => {
          setEnabled(!enabled);
          setColour(colour === 'clear' ? 'faded' : 'clear');
        }} />
        <LoadingOverlay colour={colour} />
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

const overlayCss = (height: number) => css`
  width: 100%;
  height: ${height}px;
  position: relative;
`;