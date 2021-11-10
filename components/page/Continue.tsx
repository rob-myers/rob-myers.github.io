import React from "react";
import { css } from "goober";
import Link from "./Link";

// TODO
// - hide when not on <Articles>, onclick, no close-anchor-id

export default function Continue() {

  const href = React.useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    } else if (localStorage.getItem('close-anchor-id')) {
      const href = `#${JSON.parse(localStorage.getItem('close-anchor-id')!)}`;
      localStorage.removeItem('close-anchor-id');
      return href;
    } else if (location.hash) {
      return location.hash;
    } else {
      return '';
    }
  }, []);

  return (
    <div className={rootCss}>
      <div className="fixed">
        <Link href={href} postPush={() => {
          // TODO hide
        }}>
          continue
        </Link>
      </div>
    </div>
  );
}

const width = 140;

const rootCss = css`
  position: absolute;
  right: ${width}px;
  z-index: 3;
  top: -8px;

  @media(max-width: 1024px) {
    top: 8px;
  }
  @media(max-width: 600px) {
    top: 40px;
  }

  .fixed {
    position: fixed;
    border-radius: 0 0 64px 64px;
    width: ${width}px;

    text-align: center;
    font-size: 15px;
    letter-spacing: 1px;
    padding: 6px 0 14px;
    background: #444;

    a {
      color: #fff;
    }
  }
`;
