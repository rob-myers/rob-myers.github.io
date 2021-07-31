import { css } from '@emotion/react'

export default function PanZoom() {
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
