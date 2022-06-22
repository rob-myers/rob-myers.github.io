import React from 'react';
import debounce from 'debounce';
import classNames from 'classnames';
import { css } from 'goober';

import useSiteStore from 'store/site.store';
import { cssName } from 'projects/service/css-names';
import NavItems from './NavItems';

export default function Nav() {
  const navOpen = useSiteStore(x => x.navOpen);

  React.useEffect(() => {
    // Detect currently viewed article
    const onScroll = debounce(() => useSiteStore.api.updateArticleKey(), 5);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav
        className={classNames(cssName.navMain, navCss, navOpen ? cssName.navMainOpen : cssName.navMainClosed)}
        onClick={(e) => {
          e.stopPropagation();
          if (e.target instanceof HTMLAnchorElement) return;
          useSiteStore.setState({ navOpen: !navOpen });
        }}
      >
        <div className="article-overlay" />
        <div className="handle">
          <div className="icon">
            {navOpen ? '<' : '>'}
          </div>
        </div>
        <NavItems/>
      </nav>

      <div
        className={topBarCss}
        onClick={(e) => {
          e.stopPropagation();
          if (e.target instanceof HTMLAnchorElement) return;
          useSiteStore.setState({ navOpen: !navOpen });
        }}
      />

      <HorizontalFillBar
        navOpen={navOpen}
      />
    </>
  );
}

const sidebarWidth = 256;
const handleWidth = 40;
export const barHeight = 40;

const navCss = css`
  position: fixed;
  z-index: 11;
  height: calc(100% + 200px);
  width: ${sidebarWidth}px;

  font-weight: 300;
  font-family: sans-serif;
  background-color: #222;
  color: white;
  cursor: pointer;
  opacity: 0.975;
  /** https://stackoverflow.com/questions/21003535/anyway-to-prevent-the-blue-highlighting-of-elements-in-chrome-when-clicking-quic  */
  -webkit-tap-highlight-color: transparent;
  
  left: 0;
  transition: transform 500ms ease;
  &.open {
    transform: translateX(0px);
  }
  &.closed {
    transform: translateX(-${sidebarWidth}px);
  }

  > .article-overlay {
    position: absolute;
    top: 0;
    left: ${sidebarWidth}px;
    width: 100vw;
    height: 0;
    background: rgba(0, 0, 0, .1);
  }
  @media(max-width: 1280px) {
    &.open > .article-overlay {
      height: 100%;
      background: rgba(0, 0, 0, .25);
    }
  }
  > .handle {
    position: absolute;
    top: -1px;
    right: -${handleWidth}px;
    width: ${handleWidth}px;
    height: ${barHeight + 1}px;

    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    
    .icon {
      display: flex;
      justify-content: center;
      align-items: center;
      background: #900;
      color: #fff;
      width: inherit;
      height: inherit;
      padding: 0 0 2px 0;
    }

    animation: fadeInHandle ease-in 500ms forwards;
    @keyframes fadeInHandle {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
  }
`;

const topBarCss = css`
  position: fixed;
  cursor: pointer;
  z-index: 7;
  left: 0;
  width: calc(100vw + ${sidebarWidth}px);
  height: ${barHeight}px;
  background: black;

  animation: fadeInTopBar ease-in 300ms forwards;
  @keyframes fadeInTopBar {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
`;

function HorizontalFillBar({ navOpen } : { navOpen: boolean }) {
  return <div className={classNames(fillBarCss, !navOpen && 'closed')} />;
}

const fillBarCss = css`
  min-width: ${sidebarWidth}px;
  transition: min-width 500ms ease;
  &.closed {
    min-width: 0;
  }
  @media(max-width: 1280px) {
    display: none;
  }
`;
