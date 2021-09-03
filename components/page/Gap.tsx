import { css } from "goober";

export default function Gap() {
  return <hr className={rootCss} />;
}

const rootCss = css`
  border: none;
  margin: 24px;

  @media(max-width: 600px) {
    margin: 0px;
  }
`;
