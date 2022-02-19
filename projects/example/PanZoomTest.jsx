import React from 'react';
import Panzoom, { PanzoomObject } from '@panzoom/panzoom';

export default function Focal() {

  /** @type {React.RefObject<HTMLDivElement>} */
  const elem = React.useRef(null)
  /** @type {React.MutableRefObject<PanzoomObject | undefined>} */
  const panzoomRef = React.useRef();

  React.useEffect(() => {
    if (elem.current) {
      panzoomRef.current = Panzoom(elem.current, { animate: true, canvas: true, maxScale: 10, minScale: 0.2, step: 0.1, })
      const parent = /** @type {HTMLElement} */ (elem.current.parentElement)
      parent.addEventListener('wheel', function (event) {
        panzoomRef.current?.zoomWithWheel(event)
      });
    }
  }, []);

  return (
    <div
      ref={elem}
      style={{  width: '100%', height: '100%', margin: '8px' }}
    >
      <div>Foo</div>
      <div>Bar</div>
      <div>Baz</div>
    </div>
  )
}