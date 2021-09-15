import { css } from 'goober';
import classNames from 'classnames';

export function ControlsOverlay({ enabled, toggleEnabled }: {
  enabled: boolean;
  toggleEnabled: () => void;
}) {
  return (
    <div className={controlsCss}>
      <div
        className={classNames("toggle-enabled", enabled && "enabled")}
        onClick={toggleEnabled}
      >
        {enabled ? 'enabled' : 'disabled'}
      </div>
    </div>
  );
}

const controlsCss = css`
  position: absolute;
  right: 0;
  top: -24px;
  z-index: 10;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;

  .toggle-enabled {
    cursor: pointer;
    background: #222;
    color: #bbb;
    padding: 4px 8px;
    border-radius: 4px;
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
    >
      {colour !== 'faded' && (
        <div><div className="message">
          Loading...
        </div></div>
      )}
    </div>
  );
}

const loadingCss = css`
  &:not(.faded) {
    pointer-events: none;
  }

  position: absolute;
  z-index: 5;
  width: inherit;
  height: inherit;
  background: #000;
  display: flex;
  justify-content: center;

  > div {
    display: flex;
    align-items: center;
  }
  .message {
    font-family: sans-serif;
    color: #fff;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 14px;
  }

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