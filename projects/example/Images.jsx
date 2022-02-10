import classNames from 'classnames';
import { css } from 'goober';

/**
 * @param {{ srcKey: 'geomorph-301' | 'redoubt-sketches' }} props 
 */
export default function Images(props) {

  if (props.srcKey === 'geomorph-301') {
    return (
      <div className={classNames('scrollable', rootCss)}>
        <picture>
          <img
            draggable={false}
            src="/geomorph/g-301--bridge.debug.png"
          />
        </picture>
      </div>
    );
  }

  if (props.srcKey === 'redoubt-sketches') {
    return (
      <div
        className={classNames(rootCss, css`
          background: rgb(58, 58, 58);
          filter: brightness(130%);
          padding: 16px;
          figure {
            max-width: 800px;
          }
        `)}
      >
        <figure>
          <figcaption>
            1st 1000 Cities (External)
          </figcaption>
          <img
            draggable={false}
            src="/pics/redoubt-sketch-1.png"
            width="1800" // width/height to avoid vertical reflow
            height="1436"
          />
        </figure>
        <figure>
          <figcaption>
            1000 Cities on 125 floors
          </figcaption>
          <img
            draggable={false}
            src="/pics/redoubt-sketch-2.png"
            width="1978"
            height="1508"
          />
        </figure>
      </div>
    );
  }

  return null;
}

const rootCss = css`
  height: 100%;
  overflow-y: auto;
  figure {
    margin: 0 auto;
    figcaption, img {
      width: 100%;
    }
    img {
      animation: fadein 3s;
      height: auto;
      max-width: 100%;
    }
  }
  @keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;
