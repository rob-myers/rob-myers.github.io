import { css } from 'goober';
import classNames from 'classnames';
import { iconCss } from './Icons';

export function TabsOverlay(props: Props) {
  return (
    <div className={controlsCss}>
      <div className={classNames("top-right", props.enabled && 'enabled')}>
        <span
          className={iconCss('anchor-icon-white', 'auto', 12)}
          onClick={props.clickAnchor}
        />
        <span
          className={iconCss('expand-solid', 'auto', 12)}
          onClick={props.toggleExpand}
        />
        <span onClick={props.enabled ? props.toggleEnabled : undefined}>
          disable
        </span>
      </div>
      {!props.enabled && (
        <div
          className={classNames("central", props.enabled && 'enabled')}
          onClick={props.toggleEnabled}
        >
          interact
        </div>
      )}
    </div>
  );
}

interface Props {
  enabled: boolean;
  clickAnchor: () => void;
  toggleExpand: () => void;
  toggleEnabled: () => void;
}

const controlsCss = css`
  font-family: Roboto, Arial, sans-serif;

  > .top-right {
    position: absolute;
    right: -10px;
    top: -39px;
    z-index: 2;
    /* border-radius: 4px 4px 0 0; */
    padding: 2px 16px;
    
    cursor: pointer;
    background: #444;
    font-size: 1rem;
    font-weight: 300;
    
    color: #999;
    &.enabled {
      color: #ddd;
    }

    > span:not(:last-child) {
      margin-right: 8px;
    }
  }

  > .central {
    position: absolute;
    z-index: 6;
    left: calc(50% - (128px / 2));
    top: calc(50% - 20px);
    
    cursor: pointer;
    color: #ddd;
    background: rgba(0, 0, 0, 0.7);
    padding: 12px 32px;
    border-radius: 4px;
    border: 1px solid #ddd;
    font-size: 1.2rem;
    letter-spacing: 2px;

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
      className={classNames(interactOverlayCss, {
        'clear': colour === 'clear',
        'faded': colour === 'faded',
      })}
    />
  );
}

const interactOverlayCss = css`
  &:not(.faded) {
    pointer-events: none;
  }

  position: absolute;
  z-index: 4;
  width: 100%;
  height: 100%;
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
