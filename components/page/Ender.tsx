import { css } from "goober";

export default function() {
  return <div className={rootCss} />;
}

const rootCss = css`
  background: #bfbfbf;
  margin: 0 0 32px;
  height: 2px;
`;