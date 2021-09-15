import { css } from 'goober';
import classNames from 'classnames';

export function ControlsOverlay({ enabled, toggleEnabled }: {
  enabled: boolean;
  toggleEnabled: () => void;
}) {
  return (
    <div className={controlsCss}>
      <div className="top-right" onClick={toggleEnabled}>
        {enabled ? 'enabled' : 'disabled'}
      </div>
      {!enabled && (
        <div
          className={classNames("central", enabled ? 'enabled' : 'disabled')}
          onClick={toggleEnabled}
        >
          enable
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
    top: -22px;
    z-index: 10;
    padding: 2px 8px;
    
    cursor: pointer;
    background: #333;
    color: #bbb;
    border-radius: 4px 4px 0 0;
  }

  > .central {
    position: absolute;
    z-index: 10;
    left: calc(50% - 54px);
    top: calc(50% - 24px);
    
    cursor: pointer;
    color: #ccc;
    background: rgba(50, 50, 50, 0.6);
    padding: 16px 32px;
    border-radius: 4px;
    font-size: larger;
    font-weight: 300;

    opacity: 1;
    transition: 300ms opacity ease;
    &.enabled {
      opacity: 0;
    }
    &.disabled {
      opacity: 1;
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
  z-index: 5;
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
