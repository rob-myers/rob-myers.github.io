import { css } from 'goober';
import classNames from 'classnames';
import { iconCss } from './Icons';

export function ControlsOverlay({ enabled, toggleEnabled, clickAnchor }: {
  enabled: boolean;
  toggleEnabled: () => void;
  clickAnchor: () => void;
}) {
  return (
    <div className={controlsCss}>
      <div className={classNames("top-right", enabled && 'enabled')}>
        <span
          className={iconCss('anchor-icon-white', 'auto', 10)}
          onClick={clickAnchor}
        />
        <span
          onClick={enabled ? toggleEnabled : undefined}
        >
          disable
        </span>
      </div>
      {!enabled && (
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
  font-family: Roboto, Arial, sans-serif;

  > .top-right {
    position: absolute;
    right: -10px;
    top: calc(-32px + 6px);
    z-index: 2;
    border-radius: 4px 4px 0 0;
    padding: 2px 16px;
    
    cursor: pointer;
    background: #333;
    color: #777;
    font-size: 14px;
    font-weight: 300;
    
    &.enabled {
      color: #fff;
    }

    > span:not(:last-child) {
      margin-right: 8px;
    }
  }

  > .central {
    position: absolute;
    z-index: 5;
    left: calc(50% - (128px / 2));
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
  z-index: 4;
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
