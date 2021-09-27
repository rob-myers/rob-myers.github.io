import { css } from 'goober';

/**
 * TODO make generic by passing in prop from Tabs
 * TODO provide larger link explicitly in text
 */
export default function Images() {
  return (
    <div className={rootCss}>
      <img
        draggable={false}
        src="/pics/g-301--bridge.debug.x1.png"
        // large-src="/geomorph/g-301--bridge.debug.x2.png"
      />
    </div>
  );
}

const rootCss = css`
  overflow-x: scroll;
  height: 100%;
  img {
    animation: fadein 2s;
  }

  @keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;
