import { useState } from 'react';
import { css } from '@emotion/react'
import { Rect } from '../geom/rect';

export default function PanZoom() {
  const [zoom, setZoom] = useState(100);
  const [bounds, setBounds] = useState(new Rect(0, 0, 0, 0));

  return (
    <svg
      css={css`
        width: 100%;
        height: 100%;
        background: #fff;
        /* position: absolute; */
      `}
      // onWheel={onWheel}
    >
      <rect x={5} y={5} width={20} height={20} fill="red" />
    </svg>
  );
}
