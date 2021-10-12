import React from 'react';
import debounce from 'debounce';
import classNames from 'classnames';
import { css } from 'goober';
import useSiteStore from 'store/site.store';
import NavItems from './NavItems';

export default function Nav() {
  const [navOpen, setNavOpen] = React.useState(false);

  React.useEffect(() => {
    // Detect currently viewed article
    const onScroll = debounce(() => useSiteStore.api.updateArticleKey(), 5);
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <>
      <nav
        className={classNames(navCss, navOpen ? 'open' : 'closed')}
        onClick={(e) => {
          e.stopPropagation();
          if (e.target instanceof HTMLAnchorElement) return;
          setNavOpen(!navOpen);
        }}
      >
        <div className="article-overlay" />
        <div className="handle">
          <TopBar />
          <div className="icon">
            {navOpen ? '<' : '>'}
          </div>
        </div>
        <NavItems/>
      </nav>
      <HorizontalFillBar navOpen={navOpen} />
    </>
  );
}

const sidebarWidth = 256;
const handleWidth = 36;
export const barHeight = 40;

const navCss = css`
  position: fixed;
  z-index: 10;
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
  
  transition: left 500ms ease;
  &.open {
    left: 0;
  }
  &.closed {
    left: -${sidebarWidth}px;
  }

  > .article-overlay {
    position: absolute;
    top: 0;
    left: ${sidebarWidth}px;
    width: 100vw;
    height: ${barHeight}px;
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
    z-index: 10;
    top: -1px;
    right: -${handleWidth}px;
    width: ${handleWidth}px;
    min-height: ${barHeight + 1}px;

    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;
    
    .icon {
      display: flex;
      justify-content: center;
      align-items: center;
      background: #555;
      border-radius: 28px;
      width: 28px;
      height: 28px;
      padding: 0 0 2px 0;
    }
  }
`;

function TopBar() {
  return <div className={topBarCss} />
}

const topBarCss = css`
  position: absolute;
  z-index: -1;
  left: 0;
  width: calc(100vw + ${sidebarWidth}px);
  height: ${barHeight}px;
  background: black;
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
