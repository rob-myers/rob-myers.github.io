import React, { useLayoutEffect } from 'react';
import classNames from 'classnames';
import { css } from 'goober';
import useSiteStore from 'store/site.store';
import NavItems from './NavItems';

export default function Nav() {
  const [navOpen, setNavOpen] = React.useState(false);

  useLayoutEffect(() => {
    // Detect currently viewed article
    const onScroll = () => useSiteStore.api.updateArticleKey();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return <>
    <nav
      className={classNames(navCss, navOpen ? 'open' : 'closed')}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target instanceof HTMLAnchorElement) return;
        setNavOpen(!navOpen);
      }}
    >
      <div className="handle-bg" />
      <div className="handle">{navOpen ? '<' : '>'}</div>
      <NavItems/>
    </nav>
    <div
      className={classNames(fillerCss, !navOpen && 'closed')}
    />
  </>;
}

const sidebarWidth = 256;
const handleWidth = 30;

const navCss = css`
  width: ${sidebarWidth}px;

  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  font-weight: 300;

  background-color: #222;
  color: white;
  cursor: pointer;
  opacity: 0.975;
  /** https://stackoverflow.com/questions/21003535/anyway-to-prevent-the-blue-highlighting-of-elements-in-chrome-when-clicking-quic  */
  -webkit-tap-highlight-color: transparent;
  
  position: fixed;
  z-index: 20;
  height: calc(100% + 200px);
  
  transition: left 500ms ease;
  &.open {
    left: 0;
  }
  &.closed {
    left: -${sidebarWidth}px;
  }

  > .handle-bg {
    position: absolute;
    top: 0;
    left: ${sidebarWidth}px;
    width: calc(${sidebarWidth}px + 100vw);
    height: 32px;
    background: rgba(0, 0, 0, .4);
  }
  @media(max-width: 600px) {
    
    &:not(.closed) > .handle-bg {
      height: 100%;
      background: rgba(0, 0, 0, .5);
    }
  }
  
  > .handle {
    background: rgba(120, 0, 0, 1);
    position: absolute;
    z-index: 19;
    top: -1px;
    width: ${handleWidth}px;
    min-height: 33px;
    right: -${handleWidth}px;
    text-align: center;
    padding: 7px 0;
    user-select: none;
  }

`;

const fillerCss = css`
  min-width: ${sidebarWidth}px;
  transition: min-width 500ms ease;
  &.closed {
    min-width: 0;
  }

  @media(max-width: 600px) {
    display: none;
  }
`;
