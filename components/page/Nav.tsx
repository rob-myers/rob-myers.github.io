import { NextRouter, useRouter } from 'next/router';
import React, { useEffect, useLayoutEffect } from 'react';
import classNames from 'classnames';
import { css } from 'goober';
import useSiteStore from 'store/site.store';
import { articleKeys } from 'articles/index';
import NavItems from './NavItems';

export default function Nav() {
  const [navOpen, setNavOpen] = React.useState(true);
  const router = useRouter();

  useLayoutEffect(() => {
    // Remember if nav was open
    setNavOpen(localStorage.getItem('nav-open') === 'true');
    // Detect currently viewed article
    const onScroll = () => useSiteStore.api.updateArticleKey(router);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    router.events.on('routeChangeComplete', () => handleArticleRoute({ regex: 'either' }));
    router.events.on('hashChangeComplete', () => handleArticleRoute({ regex: 'goto', rewriteGoto: router }));
    window.addEventListener('hashchange', () => handleArticleRoute({ regex: 'either' }));
    window.addEventListener('load', () => handleArticleRoute({ regex: 'goto' }));
  }, []);

  return (
    <nav
      className={classNames(navCss, !navOpen && 'closed')}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target instanceof HTMLAnchorElement) return;
        setNavOpen(!navOpen);
        localStorage.setItem('nav-open', !navOpen ? 'true' : 'false');
      }}
    >
      <div className="handle-bg" />
      <div className="handle">{navOpen ? '<' : '>'}</div>
      <NavItems/>
    </nav>
  );
}

function handleArticleRoute(opt: { regex: 'goto' | 'either'; rewriteGoto?: NextRouter; }) {
  const current = `${window.location.pathname}${window.location.hash}`;
  const matched = current.match(
    opt.regex === 'either' ? /^\/blog\/\d+#(?:goto-)?(\S+)$/ : /^\/blog\/\d+#goto-(\S+)$/
  );
  if (matched && articleKeys.includes(matched[1] as any)) {
    if (opt.rewriteGoto && useSiteStore.getState().navKey === matched[1] as any) {
      opt.rewriteGoto.replace(current.replace('#goto-', '#'));
    }
    setTimeout(() => useSiteStore.setState({ navKey: matched[1] as any, lastNav: Date.now() }));
  }
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
  
  position: fixed;
  z-index: 20;
  height: 100%;
  left: 0;
  
  transition: left 500ms ease;
  &.closed {
    left: -${sidebarWidth}px;
  }

  > .handle-bg {
    position: absolute;
    top: 0;
    left: ${sidebarWidth}px;
    width: calc(${sidebarWidth}px + 100vw);
    height: 32px;
    background: rgba(0, 0, 0, .1);
  }
  
  > .handle {
    background: rgba(120, 0, 0, 1);
    position: absolute;
    z-index: 19;
    width: ${handleWidth}px;
    top: 0;
    right: -${handleWidth}px;
    text-align: center;
    padding: 7px 0;
    user-select: none;
  }
`;
