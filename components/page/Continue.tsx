import React from 'react';
import { css } from 'goober';
import { useBeforeunload } from 'react-beforeunload';
import classNames from 'classnames';
import Link from './Link';
import useUpdate from 'projects/hooks/use-update';

/**
 * Must avoid SSR because depends on localStorage.
 */
export default function Continue() {

  const update = useUpdate();

  const [state] = React.useState(() => {
    let href = '';
    if (typeof window !== 'undefined') {
      if (localStorage.getItem(closeAnchorId)) {
        const nextHref = `#${JSON.parse(localStorage.getItem(closeAnchorId)!)}`;
        localStorage.removeItem(closeAnchorId);
        href = nextHref;
      } else if (location.hash) {
        href = location.hash;
      }
    }
    setTimeout(() => state.hide(), 4000); // Hide after 5s
    return {
      hidden: !href,
      href,
      hide: () => { state.hidden = true; update(); },
    };
  });

  useBeforeunload(() => {
    const anchors = Array.from(
      document.querySelectorAll('.anchor')
    ).filter(el => el.id && !el.id.includes('--link--'));
    const anchorHeights = Array.from(anchors).map(el => el.getBoundingClientRect().bottom);
    const index = anchorHeights.findIndex(height => height >= 0) - 1;
    if (index >= 0) {
      localStorage.setItem(closeAnchorId, JSON.stringify(anchors[index].id));
    }
  });

  return (
    <div className={rootCss}>
      <div className={classNames('fixed', state.hidden ? 'hidden' : 'shown')}>
        <Link
          href={state.href}
          postPush={state.hide}
        >
          continue
        </Link>
      </div>
    </div>
  );
}

/** Local storage key */
export const closeAnchorId = 'close-anchor-id';
const width = 140;

const rootCss = css`
  position: absolute;
  right: ${width}px;
  /** Same as Nav, so on top */
  z-index: 7;
  top: -8px;

  @media(max-width: 1024px) { top: 8px; }
  @media(max-width: 600px) { top: 40px; }

  .fixed {
    position: fixed;
    width: ${width}px;

    text-align: center;
    font-size: 15px;
    letter-spacing: 2px;
    background: #000;
    
    a {
      display: block;
      padding: 6px 0 14px;
      color: #fff;
    }

    @keyframes showContinue {
      0% { transform: translateY(-128px); }
      100% { transform: translateY(0px); }
    }
    &.shown { animation: showContinue 1s; }

    transition: transform 1s;
    &.hidden { transform: translateY(-128px); }
  }
`;
