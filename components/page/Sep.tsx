import { css } from "goober";

export default function Sep() {
  return <hr className={rootCss} />;
}

const rootCss = css`
  margin: 0;
  border-color: var(--focus-bg);

  @media(min-width: 800px) {
    padding-bottom: 80px;
    border: 0;
  }
`;
