import { css } from "goober";

export default function Scroller() {
  return (
    <div className={rootCss}>
      <div className="fixed">
        <div>
          continue
        </div>
        <div>
          earmark
        </div>
      </div>
    </div>
  );
}

const width = 140;

const rootCss = css`
  position: absolute;
  right: ${width}px;
  z-index: 10;
  top: -8px;
  
  @media(max-width: 1024px) {
    top: 8px;
  }
  @media(max-width: 600px) {
    top: 40px;
  }

  .fixed {
    position: fixed;
    border-radius: 0 0 48px 48px;
    width: ${width}px;

    height: 75px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  
    text-align: center;
    letter-spacing: 2px;
    /* font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif; */
    padding: 8px 0 16px;
    background: #222;
    color: #ccc;
    /* border: 1px solid white;
    filter: invert(); */
  }
`;
