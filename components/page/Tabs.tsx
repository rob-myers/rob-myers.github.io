import React from 'react';
import { css } from 'goober';
import classNames from 'classnames';

import type { TabMeta } from 'model/tabs/tabs.model';
import useSiteStore from 'store/site.store';
import { Layout } from 'components/dynamic';
import { TabsOverlay, LoadingOverlay } from './TabsOverlay';

export default function Tabs(props: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const [enabled, setEnabled] = React.useState(!!props.enabled);

  // initially 'black', afterwards in {'faded', 'clear'}
  const [colour, setColour] = React.useState('black' as 'black' | 'faded' | 'clear');
  React.useEffect(() => void setColour(enabled ? 'clear' : 'faded'), []);

  return (
    <figure
      ref={rootRef}
      className={classNames("tabs", "scrollable", rootCss(props.height))}
    >
      <span id={props.id} className="anchor" />
      <div className={overlayCss(props.height)}>
        {colour !== 'black' && (
          <Layout
            id={props.id}
            tabs={props.tabs}
            rootRef={rootRef}
          />
        )}
        <TabsOverlay
          enabled={enabled}
          toggleEnabled={() => {
            const next = !enabled;
            setEnabled(next);
            setColour(colour === 'clear' ? 'faded' : 'clear');
          }}
          clickAnchor={() => {
            const tabs = useSiteStore.getState().tabs[props.id];
            tabs?.scrollTo();
          }}
        />
        <LoadingOverlay colour={colour} />
      </div>
    </figure>
  );
}

interface Props {
  /** Initially enabled? */
  enabled?: boolean;
  height: number;
  /** Required */
  id: string;
  tabs: TabMeta[];
}

const rootCss = (height: number) => css`
  background: var(--focus-bg);

  @keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .flexlayout__tabset {
    animation: fadein 1s;
  }

  .flexlayout__tabset, .flexlayout__tab {
    background: white;
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

    /** react-reverse-portal wraps things in a div  */
    > div.portal {
      width: 100%;
      height: 100%;
    }
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