import { css } from "goober";

export default function() {
  return <div className={rootCss} />;
}

const rootCss = css`
  background: #ccc;
  margin: 0 0 32px;
  height: 16px;
`;