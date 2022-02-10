import classNames from 'classnames';
import { css } from 'goober';

/**
 * @param {{ srcKey: 'geomorph-301' | 'redoubt-sketches' }} props 
 * @returns 
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
        className={classNames(rootCss, centeredCss)}
        style={{ background: 'rgb(58, 58, 58)', filter: 'brightness(130%)' }}
      >
        <figure>
          <img
            draggable={false}
            src="/pics/redoubt-sketch-1.png"
            style={{ height: '90%', width: 'unset' }}
          />
          <figcaption>
            Container of 1st 1000 Cities
          </figcaption>
        </figure>
      </div>
    );
  }

  return null;
}

const rootCss = css`
  text-align: center;
  height: 100%;
  figure {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
  }
  img {
    animation: fadein 2s;
    width: 100%;
  }
  @keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;

const centeredCss = css`
  display: flex;
  justify-content: center;
  picture {
    display: flex;
    align-items: center;
  }
`;