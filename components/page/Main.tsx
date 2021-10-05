import React, { useEffect } from 'react';
import { css } from "goober";
import useSiteStore from 'store/site.store';
import Nav from './Nav';
import Title from "./Title";

export default function Main({ children }: React.PropsWithChildren<{}>) {

  // Scroll to article navKey onchange lastNav.
  // Initially, <Articles> must already be mounted.
  const lastNav = useSiteStore(x => x.lastNav);
  useEffect(() => {
    const { navKey, articles } = useSiteStore.getState();
    if (articles[navKey || '']) {
      window.scrollTo({ top: articles[navKey || ''].rect.y, behavior: 'smooth' });
    }
  }, [lastNav]);

  return (
    <>
      <Nav/>
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
  @media(max-width: 500px) {
    padding: 0;
  }
`;
