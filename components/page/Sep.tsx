import { css } from "goober";

export default function Sep() {
  return <hr className={rootCss} />;
}

const rootCss = css`
  margin: 0;
  border-color: rgba(0, 0, 0, 0.2);
`;
