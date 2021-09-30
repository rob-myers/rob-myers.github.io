import { css } from 'goober';
import classNames from 'classnames';

export function ControlsOverlay({ enabled, toggleEnabled }: {
  enabled: boolean;
  toggleEnabled: () => void;
}) {
  return (
    <div className={controlsCss}>
      {enabled
        ? (
          <div className="top-right" onClick={toggleEnabled}>
            disable
          </div>
        ) : (
          <div
            className={classNames("central", enabled && 'enabled')}
            onClick={toggleEnabled}
          >
            interact
          </div>
        )}
    </div>
  );
}

const controlsCss = css`
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;

  > .top-right {
    position: absolute;
    right: 0;
    top: 2px;
    z-index: 10;
    padding: 2px 8px;
    
    cursor: pointer;
    background: #333;
    color: #fff;
    border-radius: 4px 4px 0 0;
    font-size: 1rem;
  }

  > .central {
    position: absolute;
    z-index: 11;
    left: calc(50% - 56px);
    top: calc(50% - 20px);
    
    cursor: pointer;
    color: #ddd;
    background: #000;
    padding: 12px 32px;
    border-radius: 4px;
    border: 1px solid #ddd;
    font-size: 1.2rem;

    opacity: 1;
    transition: 300ms opacity ease;
    &.enabled {
      opacity: 0;
    }
  }
`;

export function LoadingOverlay({ colour }: {
  colour: 'black' | 'faded' | 'clear';
}) {
  return (
    <div
      className={classNames(loadingCss, {
        'clear': colour === 'clear',
        'faded': colour === 'faded',
      })}
    />
  );
}

const loadingCss = css`
  &:not(.faded) {
    pointer-events: none;
  }

  position: absolute;
  z-index: 10;
  width: inherit;
  height: inherit;
  background: #000;
  font-family: sans-serif;

  opacity: 1;
  transition: opacity 1s ease-in;
  &.clear {
    opacity: 0;
    transition: opacity 0.5s ease-in;
  }
  &.faded {
    opacity: 0.5;
    transition: opacity 0.5s ease-in;
  }
`;
