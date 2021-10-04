import React, { useEffect } from 'react';
import classNames from 'classnames';
import { css } from "goober";
import Title from "./Title";

export default function Main({ children }: React.PropsWithChildren<{}>) {
  const [navOpen, setNavOpen] = React.useState(false);

  useEffect(() => {
    const close = (e: MouseEvent) => setNavOpen(false);
    document.body.addEventListener('click', close);
    return () => document.body.removeEventListener('click', close);
  }, []);

  return <>
    <nav
      className={classNames(navCss, !navOpen && 'closed')}
      onClick={(e) => {
        e.stopPropagation();
        setNavOpen(x => !x);
      }}
    >
      <div className="handle">
        {navOpen ? '<' : '>'}
      </div>
      sidenav
    </nav>
    <section className={classNames(rootCss)}>
      <Title />
      <main>
        {children}
      </main>
    </section>
  </>;
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

const sidebarWidth = 120;
const handleWidth = 20;

const navCss = css`
  color: white;
  background-color: rgba(0, 0, 0, 0.3);
  cursor: pointer;
  
  position: fixed;
  z-index: 20;
  left: 0;
  height: 100%;
  width: ${sidebarWidth}px;
  padding: 16px;

  transition: left 500ms ease;
  &.closed {
    left: -${sidebarWidth - 0}px;
  }

  .handle {
    background: rgba(0, 0, 0, 0.5);
    position: absolute;
    width: ${handleWidth}px;
    top: 0;
    right: -${handleWidth}px;
    text-align: center;
    padding: 2px;
  }
`;