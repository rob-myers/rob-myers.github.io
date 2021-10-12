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
    const onScroll = debounce(() => useSiteStore.api.updateArticleKey(), 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
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
        <div className="handle-bg" />
        <div className="handle">{navOpen ? '<' : '>'}</div>
        <NavItems/>
      </nav>
      <FillBar navOpen={navOpen} />
    </>
  );
}

const sidebarWidth = 256;
const handleWidth = 30;

const navCss = css`
  position: fixed;
  z-index: 20;
  height: calc(100% + 200px);
  width: ${sidebarWidth}px;

  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  font-weight: 300;

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

  > .handle-bg, .article-overlay {
    position: absolute;
    top: 0;
    left: ${sidebarWidth}px;
    width: 100vw;
    height: 32px;
    background: rgba(0, 0, 0, .25);
  }
  @media(max-width: 600px) {
    &:not(.closed) > .article-overlay {
      height: 100%;
      background: rgba(0, 0, 0, .5);
    }
  }
  > .handle {
    position: absolute;
    z-index: 19;
    top: -1px;
    right: -${handleWidth}px;
    width: ${handleWidth}px;
    min-height: 33px;

    background: rgba(120, 0, 0, 1);
    text-align: center;
    padding: 7px 0;
    user-select: none;
  }
`;

function FillBar({ navOpen } : { navOpen: boolean }) {
  return <div className={classNames(fillerCss, !navOpen && 'closed')} />;
}

const fillerCss = css`
  min-width: ${sidebarWidth}px;
  transition: min-width 500ms ease;
  &.closed {
    min-width: 0;
  }
  @media(max-width: 1280px) {
    display: none;
  }
`;
