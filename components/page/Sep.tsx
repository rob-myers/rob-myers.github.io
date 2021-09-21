import { css } from "goober";

export default function Sep() {
  return <hr className={rootCss} />;
}

const rootCss = css`
  margin: 48px 0 24px;

  @media(max-width: 600px) {
    margin: 12px 0;
  }
`;
