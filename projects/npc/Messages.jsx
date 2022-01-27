import React from 'react';
import classNames from 'classnames';
import { css } from 'goober';
import { Rect } from '../geom';

/** @param {NPC.MessagesProps} props */
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
    const measurer = /** @type {CanvasRenderingContext2D} */ (document.createElement('canvas').getContext('2d'));
    measurer.font = `${meta.fontSize}px ${meta.fontFamily}`;

    props.onLoad?.({
      create: (key, text, { x, y }) => {
        const { width } = measurer.measureText(text);
        const rect = (new Rect(
          x,
          y,
          width + 2 * (meta.pad[1] + meta.borderRadius),
          meta.fontSize + 2 * (meta.pad[0] + meta.borderRadius)
        )).json;

        const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        fo.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
        fo.setAttribute('class', `message ${key}`);
        Object.entries(rect).forEach((([k, v]) => fo.setAttribute(k ,`${v}`)));

        fo.appendChild(document.createElement('div')).textContent = text;
        state.root.appendChild(fo);
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
    font-size: ${meta.fontSize}px;
    font-family: ${meta.fontFamily};
    padding: ${meta.pad[0]}px ${meta.pad[1]}px;
    line-height: 1;

    background: rgba(0, 0, 0, 0.4);
    color: white;
    border-radius: ${meta.borderRadius}px;
  }
`;
