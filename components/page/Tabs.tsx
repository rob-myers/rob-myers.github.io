import React from 'react';
import { css } from 'goober';
import classNames from 'classnames';
import { enableBodyScroll, disableBodyScroll } from 'body-scroll-lock';

import type { TabMeta } from 'model/tabs/tabs.model';
import useSiteStore from 'store/site.store';
import { Layout } from 'components/dynamic';
import { TabsOverlay, LoadingOverlay } from './TabsOverlay';
import { useUpdate } from 'projects/hooks';

export default function Tabs(props: Props) {

  const trigger = useUpdate();

  const [state] = React.useState(() => ({
    enabled: !!props.enabled,
    /** Initially `'black'`; afterwards always in `['faded', 'clear']` */
    colour: 'black' as 'black' | 'faded' | 'clear',
    expanded: false,
    contentDiv: undefined as undefined | HTMLDivElement,

    toggleEnabled: () =>  {
      state.enabled = !state.enabled;
      state.colour = state.colour === 'clear' ? 'faded' : 'clear';
      trigger();

      const tabs = useSiteStore.getState().tabs[props.id];
      if (tabs) {
        const portalLookup = useSiteStore.getState().portal;
        const tabKeys = tabs.getTabNodes().map(x => x.getId()).filter(x => x in portalLookup);
        tabKeys.forEach(key => portalLookup[key].portal.setPortalProps({ disabled: !state.enabled }));
        // Other tab portals may not exist yet, so we record in `tabs` too
        tabs.disabled = !state.enabled;
      } else {
        console.warn(`Tabs not found for id "${props.id}". Expected Markdown syntax <div class="tabs" name="my-identifier" ...>.`);
      }
    },
    toggleExpand: () => {
      state.expanded = !state.expanded;
      state.expanded && !state.enabled && state.toggleEnabled();
      trigger();
    },
    onModalBgPress: () => {
      state.expanded = false;
      trigger();
    },
    preventTouch: (e: React.TouchEvent) => e.preventDefault(),
  }));

  React.useEffect(() => {
    // Initially trigger CSS animation
    state.colour = state.enabled ? 'clear' : 'faded';
    trigger();
  }, []);

  React.useEffect(() => void (state.contentDiv &&
    (state.expanded ? disableBodyScroll : enableBodyScroll)(state.contentDiv)
  ), [state.expanded]);

  return (
    <figure className={classNames("tabs", "scrollable", rootCss)}>
      <span id={props.id} className="anchor" />

      {state.expanded && <>
        <div
          className="modal-backdrop"
          onPointerUp={state.onModalBgPress}
          onTouchStart={state.preventTouch}
        />
        <div
          className={fillSmallModalCss(props.height)}
        />
      </>}

      <div
        ref={(el) => el && (state.contentDiv = el)}
        className={state.expanded ? expandedCss : unexpandedCss(props.height)}
      >
        {state.colour !== 'black' && (
          <Layout id={props.id} tabs={props.tabs} />
        )}
        <TabsOverlay
          enabled={state.enabled}
          expanded={state.expanded}
          clickAnchor={() => {
            const tabs = useSiteStore.getState().tabs[props.id];
            tabs?.scrollTo();
          }}
          toggleExpand={state.toggleExpand}
          toggleEnabled={state.toggleEnabled}
        />
        <LoadingOverlay
          colour={state.colour}
        />
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

const rootCss = css`
  margin: 64px 0;
  @media(max-width: 600px) {
    margin: 40px 0 32px 0;
  }

  background: var(--focus-bg);

  position: relative;
  > span.anchor {
    position: absolute;
    top: -96px;
  }

  .modal-backdrop {
    position: fixed;
    z-index: 19;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
  }

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

  .flexlayout__layout {
    background: #444;
  }
  .flexlayout__tab {
    border-top: 6px solid #444;
    position: relative;
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

const unexpandedCss = (height: number) => css`
  width: 100%;
  height: ${height}px;
  position: relative;
  border: 10px solid #444;
`;

/** When expanded we need to fill original space */
const fillSmallModalCss = (height: number) => css`
  height: ${height}px;
  background: #fff;
`;

const expandedCss = css`
  position: fixed;
  z-index: 20;
  top: 80px;
  left: 5%;
  width: 90%;
  height: calc(100% - 160px);
  border: 10px solid #444;
  @media(max-width: 600px) {
    left: 0;
    top: 80px;
    width: 100%;
    height: calc(100% - 120px);
   }
`;
