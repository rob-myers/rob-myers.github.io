import { useRouter } from 'next/router';
import React, { useEffect, useLayoutEffect } from 'react';
import classNames from 'classnames';
import { css } from 'goober';
import useSiteStore from 'store/site.store';
import { ArticleKey, articlesMeta, navGroups } from 'articles/index';
import NavItems from './NavItems';

export default function Nav() {
  const [navOpen, setNavOpen] = React.useState(false);
  const router = useRouter();

  useLayoutEffect(() => {
    // Detect currently viewed article
    const onScroll = () => useSiteStore.api.updateArticleKey(router);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {

    const pathRegex = /^\/blog\/\d+#goto-(\S+)$/;
    const relPath = () => `${window.location.pathname}${window.location.hash}`;
    const isArticleKey = (x: string): x is ArticleKey => x in articlesMeta;
    const triggerScroll = (navKey: ArticleKey) => {
      setTimeout(() => useSiteStore.setState({ targetNavKey: navKey, navAt: Date.now() }));
    };

    // Handle nav links to another page (click/back/forward)
    function routeChangeComplete() {
      useSiteStore.setState({ targetNavKey: null });
      const matched = relPath().match(pathRegex);
      if (matched && isArticleKey(matched[1])) {
        if (navGroups.some(group => group[0].key === matched[1])) {
          // No need to scroll to 1st article
        } else {
          const articleKey = matched[1];
          useSiteStore.api.onLoadArticles(() => triggerScroll(articleKey));
        }
      }
    }

    // Handle nav links within same page (click/back/forward)
    function hashChangeComplete() {
      const matched = relPath().match(pathRegex);
      if (matched && isArticleKey(matched[1])) {
        const { targetNavKey, articleKey } = useSiteStore.getState();
        if (targetNavKey === null || articleKey === targetNavKey) {
          triggerScroll(matched[1]);
        } else if (targetNavKey === matched[1]) {// Just arrived
          useSiteStore.setState({ targetNavKey: null });
        }
      }
    }

    // On back/forward rewrite #near- as #goto-
    router.beforePopState(() => {
      if (relPath().match(/^\/blog\/\d+#near-(\S+)$/)) {
        router.replace(relPath().replace('#near-', '#goto-'))
        hashChangeComplete(); // Why does this help?
        return false;
      }
      return true;
    });

    function onLoad() {
      useSiteStore.api.onLoadArticles(hashChangeComplete);
    }

    router.events.on('routeChangeComplete', routeChangeComplete);
    router.events.on('hashChangeComplete', hashChangeComplete);
    window.addEventListener('load', onLoad);

    return () => {
      router.events.off('routeChangeComplete', routeChangeComplete);
      router.events.off('hashChangeComplete', hashChangeComplete);
      window.removeEventListener('load', onLoad);
    };
  }, []);

  return <>
    <nav
      className={classNames(navCss, navOpen ? 'open' : 'closed')}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target instanceof HTMLAnchorElement) {
          return;
        }
        setNavOpen(!navOpen);
        localStorage.setItem('nav-open', !navOpen ? 'true' : 'false');
      }}
    >
      <div className="handle-bg" />
      <div className="handle">{navOpen ? '<' : '>'}</div>
      <NavItems/>
    </nav>
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
