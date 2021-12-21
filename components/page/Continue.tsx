import React from 'react';
import { css } from 'goober';
import { useBeforeunload } from 'react-beforeunload';
import Link from './Link';

// TODO
// - understand when it is should appear
// - understand when it should vanish
// - animate so emerges, then hides
// - hide when on click, on scroll away

export default function Continue() {

  useBeforeunload(() => {
    const anchors = Array.from(
      document.querySelectorAll('.anchor')
    ).filter(el => el.id && !el.id.includes('--link--'));
    const anchorHeights = Array.from(anchors).map(el => el.getBoundingClientRect().y);
    const index = anchorHeights.findIndex(height => height > 0) - 1;
    if (index >= 0) {
      localStorage.setItem(closeAnchorId, JSON.stringify(anchors[index].id));
    }
  });

  const href = React.useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    } else if (localStorage.getItem(closeAnchorId)) {
      const href = `#${JSON.parse(localStorage.getItem(closeAnchorId)!)}`;
      localStorage.removeItem(closeAnchorId);
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

export const closeAnchorId = 'close-anchor-id';
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
    /* border-radius: 0 0 64px 64px; */
    width: ${width}px;

    text-align: center;
    font-size: 15px;
    letter-spacing: 2px;
    padding: 6px 0 14px;
    background: #000;

    a {
      color: #fff;
    }
  }
`;
