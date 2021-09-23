import { css } from "goober";

export default function Sep() {
  return <hr className={rootCss} />;
}

const rootCss = css`
  margin: 0;
  border-color: rgba(0, 0, 0, 0.2);
  @media(min-width: 800px) {
    padding-bottom: 64px;
    border: 0;
  }
`;
