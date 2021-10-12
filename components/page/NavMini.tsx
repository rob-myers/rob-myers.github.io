import { css } from "goober";

export default function NavMini() {
  return (
    <div className={rootCss}>
      <div className="inner">
        todo
      </div>
    </div>
  );
}

const rootCss = css`
  position: absolute;
  z-index: 20;
  right: 64px;

  top: -48px;
  @media(max-width: 1024px) {
    top: -32px;
  }
  @media(max-width: 600px) {
    top: 0;
  }

  .inner {
    position: fixed;
    width: 64px;
    height: 32px;
    padding: 6px;
    background: black;
    color: white;
    display: flex;
    justify-content: center;
  }
`;
