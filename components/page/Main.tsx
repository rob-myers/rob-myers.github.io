import React, { useEffect } from 'react';
import { css } from "goober";
import useSiteStore from 'store/site.store';
import Portals from './Portals';
import Title from "./Title";

export default function Main({ children }: React.PropsWithChildren<{}>) {
  const lastNav = useSiteStore(x => x.navAt);

  // Scroll to article navKey on change lastNav.
  // Initially <Articles> must already be mounted.
  useEffect(() => {
    const { targetNavKey, articles } = useSiteStore.getState();
    lastNav && targetNavKey && articles[targetNavKey] && window.scrollTo({
      behavior: 'smooth',
      top: articles[targetNavKey].rect.y - 32,
    });
  }, [lastNav]);

  return (
    <>
      <Portals
        // TODO site-wide portals in _app
      />
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
  @media(max-width: 600px) {
    padding: 0;
  }
`;
