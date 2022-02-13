import React from 'react';
import classNames from 'classnames';
import { css } from 'goober';
import { getSvgScale } from 'projects/service/dom';

/**
 * Generic approach to foreignObject width/height:
 * - Bunch of vertically stacked divs
 * - initially 100% then fits
 *
 * TODO make some meaningful messages
 */

/** @param {NPCTest.MessagesProps} props */
export default function Messages(props) {

  const [state] = React.useState(() => {
    const output = {
      root: /** @type {SVGGElement} */ ({}),
      /** @type {React.RefCallback<SVGGElement>} */
      rootRef(el) {
        el && (state.root = el);
      },
    };
    return output;
  });

  React.useEffect(() => {
    props.onLoad?.({
      createText: (key, texts, { x, y }) => {
        const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        fo.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
        fo.setAttribute('class', `message ${key}`);
        Object.entries({ x, y, width: '100%', height: '100%' }).forEach((([k, v]) => fo.setAttribute(k ,`${v}`)));

        const root = fo.appendChild(document.createElement('div'));
        texts.forEach(text => root.appendChild(document.createElement('div')).textContent = text);
        state.root.appendChild(fo);

        setTimeout(() => {// Resize to fit
          const scale = getSvgScale(/** @type {SVGSVGElement} */ (fo.ownerSVGElement));
          const rects = Array.from(root.children).map(x => x.getBoundingClientRect());
          const width = Math.max(...rects.map(r => r.width)) * scale;
          const height = rects.reduce((sum, rect) => sum + rect.height, 0) * scale;
          fo.setAttribute('width', `${width}`);
          fo.setAttribute('height', `${height}`);
        }, 100);
      },
      get: (key) => {
        const results = state.root.querySelectorAll(`message .${key}`);
        return results.length
          ? /** @type {SVGForeignObjectElement} */ (results[0])
          : undefined;
      },
      remove: (key) => {
        const results = state.root.querySelectorAll(`.${key}`);
        results.forEach(node => node.remove());
        return results.length > 0;
      },
    });
  }, []);


  return (
    <g
      className={classNames("messages", rootCss)}
      ref={state.rootRef}
    />
  );
}

const meta = {
  /** Pixels */
  fontSize: 12,
  fontFamily: 'sans-serif',
  /** [vert, horiz] Pixels */
  pad: [4, 8],
  borderRadius: 2,
};


const rootCss = css`
  foreignObject > div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    font-size: ${meta.fontSize}px;
    font-family: ${meta.fontFamily};
    line-height: 1;
    
    color: white;
    > div {
      padding: ${meta.pad[0]}px ${meta.pad[1]}px;
      background: rgba(0, 0, 0, 0.4);
      border-radius: ${meta.borderRadius}px;
    }
  }
`;
