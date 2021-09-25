import React from 'react';
import { css } from 'goober';
import classNames from 'classnames';
import { Layout } from 'components/dynamic';
import type { TabMeta } from './TabsAux';
import { ControlsOverlay, LoadingOverlay } from './TabsOverlay';

/**
 * TODO clean and simplify this component
 */
export default function Tabs(props: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const [colour, setColour] = React.useState('black' as 'black' | 'faded' | 'clear');
  const [enabled, setEnabled] = React.useState(!!props.enabled);
  React.useEffect(() => void setColour(enabled ? 'clear' : 'faded'), []);

  return (
    <figure
      ref={rootRef}
      className={classNames("tabs", "scrollable", rootCss(props.height))}
    >
      <div className={overlayCss(props.height)}>
        {colour !== 'black' && (
          <Layout storeKey={props.storeKey} tabs={props.tabs} rootRef={rootRef} />
        )}
        <ControlsOverlay enabled={enabled} toggleEnabled={() => {
          setEnabled(!enabled);
          setColour(colour === 'clear' ? 'faded' : 'clear');
        }} />
        <LoadingOverlay colour={colour} />
      </div>
    </figure>
  );
}

export interface Props {
  /** Initially enabled? */
  enabled?: boolean;
  height: number;
  storeKey?: string;
  tabs: TabMeta[];
}

const rootCss = (height: number) => css`
  background: var(--focus-bg);

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