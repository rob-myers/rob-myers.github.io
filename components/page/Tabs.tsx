import React from 'react';
import { css } from 'goober';
import classNames from 'classnames';
import { enableBodyScroll, disableBodyScroll } from 'body-scroll-lock';

import type { TabMeta } from 'model/tabs/tabs.model';
import useSiteStore from 'store/site.store';
import { tryLocalStorageGet, tryLocalStorageSet } from 'projects/service/generic';
import useUpdate from 'projects/hooks/use-update';
import useStateRef from 'projects/hooks/use-state-ref';
import { Layout } from 'components/dynamic';
import { TabsOverlay, LoadingOverlay } from './TabsOverlay';

export default function Tabs(props: Props) {

  const update = useUpdate();
  const expandedStorageKey = `expanded@tab-${props.id}`;

  const state = useStateRef(() => ({
    enabled: !!props.initEnabled,
    /**
     * Initially `'black'`, and afterwards always in `['faded', 'clear']`
     */
    colour: 'black' as 'black' | 'faded' | 'clear',
    expanded: false,
    contentDiv: undefined as undefined | HTMLDivElement,

    toggleEnabled() {
      state.enabled = !state.enabled;
      state.colour = state.colour === 'clear' ? 'faded' : 'clear';
      if (!state.enabled && state.expanded) {
        state.toggleExpand(); // Disable triggers minimize
      }

      const tabs = useSiteStore.getState().tabs[props.id];
      if (tabs) {
        // Set disabled `false` for all visible tabs
        const portalLookup = useSiteStore.getState().portal;
        const tabKeys = tabs.getTabNodes()
          .filter(x => x.isVisible())
          .map(x => x.getId())
          .filter(x => x in portalLookup);
        tabKeys.forEach(key => portalLookup[key].portal.setPortalProps({ disabled: !state.enabled }));
        // Other tab portals may not exist yet, so we record in `tabs` too
        tabs.disabled = !state.enabled;
      } else {
        console.warn(
          `Tabs not found for id "${props.id}". ` +
          `Expected Markdown syntax <div class="tabs" name="my-identifier" ...>`
        );
      }

      update();
    },
    toggleExpand() {
      state.expanded = !state.expanded;
      if (state.expanded) {
        tryLocalStorageSet(expandedStorageKey, 'true');
        if (!state.enabled) {// Auto-enable on expand
          state.toggleEnabled();
        }
      } else {
        localStorage.removeItem(expandedStorageKey);
      }
      update();
    },
    // TODO doesn't fire if click on Tabs
    onKeyUp(e: React.KeyboardEvent) {
      if (state.expanded && e.key === 'Escape') {
        state.toggleExpand();
      }
    },
    onModalBgPress() {
      if (state.expanded) {
        state.toggleExpand();
      }
    },
    preventTouch(e: React.TouchEvent) {
      e.preventDefault();
    },
  }));

  React.useEffect(() => {// Initially trigger CSS animation
    state.colour = state.enabled ? 'clear' : 'faded';

    if (tryLocalStorageGet(expandedStorageKey) === 'true') {
      if (!useSiteStore.getState().navOpen) {
        state.expanded = true;
        location.href = `#${props.id}`;
      } else {// Ignore maximise if menu open (just navigated to page)
        localStorage.removeItem(expandedStorageKey);
      }
    }
    update();
  }, []);

  React.useEffect(() => void (state.contentDiv &&
    (state.expanded ? disableBodyScroll : enableBodyScroll)(state.contentDiv)
  ), [state.expanded]);

  return (
    <figure
      className={classNames("tabs", "scrollable", rootCss)}
      onKeyUp={state.onKeyUp}
      tabIndex={0}
    >
      <span id={props.id} className="anchor" />

      {state.expanded && <>
        <div
          className="modal-backdrop"
          onPointerDown={state.onModalBgPress}
          onTouchStart={state.preventTouch}
        />
        <div
          className={fillInlineSpaceCss(props.height)}
        />
      </>}

      <div
        ref={(el) => el && (state.contentDiv = el)}
        className={state.expanded ? expandedCss : unexpandedCss(props.height)}
      >
        {state.colour !== 'black' && (
          <Layout
            id={props.id}
            tabs={props.tabs}
            initEnabled={!!props.initEnabled}
          />
        )}
        <TabsOverlay
          enabled={state.enabled}
          expanded={state.expanded}
          parentTabsId={props.id}
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

export interface Props {
  /** Required */
  id: string;
  /** First tabs are shown initially, rest are background */
  tabs: [TabMeta[], TabMeta[]];
  initEnabled?: boolean;
  height: number | number[];
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

  .flexlayout__tabset, .flexlayout__tab {
    background: white;
  }

  .flexlayout__layout {
    background: #444;
  }
  .flexlayout__tab {
    /** Pixel 5: white lines when 4px */
    border-top: 3px solid #444;
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
    font-size: 0.7rem;
    font-family: sans-serif;
    font-weight: 300;
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

const unexpandedCss = (height: number | number[]) => css`
  width: 100%;
  height: ${Array.isArray(height) ? height[1] : height}px;
  position: relative;
  border: var(--tabs-border-width) solid #444;
  
  @media(max-width: 600px) {
    height: ${Array.isArray(height) ? height[0] : height}px;
  }
`;

/** When expanded we need to fill original space */
const fillInlineSpaceCss = (height: number | number[]) => css`
  height: ${Array.isArray(height) ? height[1] : height}px;
  @media(max-width: 600px) {
    height: ${Array.isArray(height) ? height[0] : height}px;
  }
  background: #fff;
`;

const expandedCss = css`
  position: fixed;
  z-index: 20;
  top: 80px;
  left: calc(max(5%, (100% - 1000px) / 2));
  width: calc(min(90%, 1000px));
  height: calc(100% - 80px);
  border: var(--tabs-border-width) solid #444;
  @media(max-width: 600px) {
    left: 0;
    top: 80px;
    width: 100%;
    height: calc(100% - 80px);
   }
`;
