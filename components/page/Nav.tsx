import { NextRouter, useRouter } from 'next/router';
import React, { useEffect, useLayoutEffect } from 'react';
import classNames from 'classnames';
import { css } from 'goober';
import useSiteStore from 'store/site.store';
import { ArticleKey, articlesMeta } from 'articles/index';
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

  /**
   * Scroll when navigating between articles.
   * We don't scroll when refreshing current article /blog/{n}#{articleKey}
   */
  useEffect(() => {
    const relPath = () => `${window.location.pathname}${window.location.hash}`;
    const isArticleKey = (x: string): x is ArticleKey => x in articlesMeta;

    function triggerScroll(navKey: ArticleKey) {
      return setTimeout(() => useSiteStore.setState({ navKey, lastNav: Date.now() }));
    }
    function removeGoto() {
      router.asPath.includes('#goto-') && router.replace(relPath().replace('#goto-', '#'));
    }
    function removeGotoIfSelf(nextNavKey: ArticleKey) {
      useSiteStore.getState().navKey === nextNavKey && removeGoto();
    }

    // Triggered when navigate to /blog/2#goto-bar from /blog/1#foo 
    // Triggered when go forward/back between /blog/1#foo
    router.events.on('routeChangeComplete', () => {
      const matched = relPath().match(/^\/blog\/\d+#(?:goto-)?(\S+)$/);
      if (matched && isArticleKey(matched[1])) {
        removeGoto(); // Ensure goto removed when don't scroll into new article
        triggerScroll(matched[1]);
      }
    });

    // Triggered when navigate to /blog/1#goto-baz from /blog/1#foo
    // Must not trigger when navigate to /blog/1#foo (e.g. while auto-scroll)
    router.events.on('hashChangeComplete', () => {
      const matched = relPath().match(/^\/blog\/\d+#goto-(\S+)$/);
      if (matched && isArticleKey(matched[1])) {
        removeGotoIfSelf(matched[1]);
        triggerScroll(matched[1]);
      }
    });

    // Triggered on user manually change hash
    window.addEventListener('hashchange', () => {
      const matched = relPath().match(/^\/blog\/\d+#(?:goto-)?(\S+)$/);
      if (matched) {
        if (matched[0].includes('#goto-') && isArticleKey(matched[1])) {
          removeGotoIfSelf(matched[1]);
          triggerScroll(matched[1]);
        } else if (isArticleKey(matched[1]) && matched[1] !== useSiteStore.getState().articleKey) {
          triggerScroll(matched[1]); // Scroll to non-goto if not current article
        }
      }
    });

    // Triggered initially, and on user navigate
    window.addEventListener('load', () => {
      const matched = relPath().match(/^\/blog\/\d+#(?:goto-)?(\S+)$/);
      if (matched) {
        if (matched[0].includes('#goto-') && isArticleKey(matched[1])) {
          removeGoto();
          triggerScroll(matched[1]);
        } else if (isArticleKey(matched[1]) && matched[1] !== useSiteStore.getState().articleKey) {
          triggerScroll(matched[1]); // Scroll to non-goto if not current article
        }
      }
    });

  }, []);

  return (
    <nav
      className={classNames(navCss, !navOpen && 'closed')}
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
  );
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
    background: rgba(0, 0, 0, .4);
  }
  @media(max-width: 500px) {
    &:not(.closed) > .handle-bg {
      height: 100%;
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
