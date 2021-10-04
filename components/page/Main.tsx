import React, { useLayoutEffect } from 'react';
import classNames from 'classnames';
import { css } from "goober";
import Title from "./Title";
import NavItems from './NavItems';

export default function Main({ children }: React.PropsWithChildren<{}>) {
  const [navOpen, setNavOpen] = React.useState(false);

  useLayoutEffect(() => {
    setNavOpen(localStorage.getItem('nav-open') === 'true');
  }, []);

  return (
    <>
      <nav
        className={classNames(navCss, !navOpen && 'closed')}
        onClick={(e) => {
          e.stopPropagation();
          if (matchMedia(`(max-width: ${forceOpenWidth}px)`).matches) {
            setNavOpen(x => !x);
            localStorage.setItem('nav-open', !navOpen ? 'true' : 'false');
          }
        }}
      >
        <div className="handle-bg" />
        <div className="handle">{navOpen ? '<' : '>'}</div>
        <NavItems/>
      </nav>

      <div className={metaPanelCss} />

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
const forceOpenWidth = 1400;

const navCss = css`
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  font-weight: 300;

  color: white;
  background-color: black;
  cursor: pointer;
  opacity: 0.9;
  
  position: fixed;
  z-index: 20;
  left: 0;
  height: 100%;
  width: ${sidebarWidth}px;

  padding: 8px;

  transition: left 500ms ease;
  @media(max-width: ${forceOpenWidth}px) {
    &.closed {
      left: -${sidebarWidth}px;
    }
    > .handle-bg {
      position: absolute;
      top: 0;
      left: ${sidebarWidth }px;
      width: ${sidebarWidth + 2000}px;
      height: 32px;
      background: rgba(0, 0, 0, .3);
    }
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

    transition: opacity 300ms ease;
    @media(min-width: ${forceOpenWidth}px) {
      opacity: 0;
    }
  }
`;

const metaPanelCss = css`
  position: fixed;
  background: #ccc;
  right: 0;
  width: 200px;
  height: 100%;
  transition: opacity 300ms ease;
  @media(max-width: ${forceOpenWidth}px) {
    opacity: 0;
  }
`;