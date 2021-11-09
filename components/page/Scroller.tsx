import { css } from "goober";

export default function Scroller() {
  return (
    <div className={rootCss}>
      scroller
    </div>
  );
}

const rootCss = css`
  position: fixed;
  top: calc(32px + 32px);
  right: 0;
  z-index: 10;

  border-radius: 64px 0 0 64px;
  padding: 16px;
  background: #000;
  color: #fff;
`;
