import React, { useEffect, useLayoutEffect } from 'react';
import classNames from 'classnames';
import { css } from "goober";
import Title from "./Title";
import NavItems from './NavItems';
import useSiteStore from 'store/site.store';

export default function Main({ children }: React.PropsWithChildren<{}>) {
  const [navOpen, setNavOpen] = React.useState(true);

  useLayoutEffect(() => {
    // Remember if nav open
    setNavOpen(localStorage.getItem('nav-open') === 'true');
    // Detect current article
    const onScroll = () => useSiteStore.api.updateArticleKey();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const lastNavKey = useSiteStore(x => x.lastNavKey);

  useEffect(() => {
    const article = useSiteStore.getState().articles[lastNavKey || ''];
    if (article) {
      window.scrollTo({ top: article.rect.y, behavior: 'smooth' });
    }
  }, [lastNavKey]);

  return (
    <>
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

      <section className={rootCss}>
        <Title />
        <main>
          {children}
        </main>
      </section>
    </>
  );
}

export const rootCss = css`
  max-width: 1024px;
  width: 100%;

  padding: 48px 64px;
  @media(max-width: 1024px) {
    padding: 32px 64px;
    margin: 0;
  }
  @media(max-width: 800px) {
    padding: 32px 8px;
  }
  @media(max-width: 500px) {
    padding: 0;
  }
`;

const sidebarWidth = 256;
const handleWidth = 30;

const navCss = css`
  width: ${sidebarWidth}px;

  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  font-weight: 300;

  color: white;
  background-color: black;
  cursor: pointer;
  opacity: 0.95;
  
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
    left: ${sidebarWidth }px;
    width: ${sidebarWidth + 2000}px;
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
