import { css } from 'goober';
import classNames from 'classnames';
import { iconCss } from './Icons';

export function TabsOverlay(props: Props) {
  return (
    <div className={controlsCss}>
      <div className={classNames("top-right", props.enabled && 'enabled')}>
        <div
          className={iconCss('anchor-icon-white', 'auto', 13)}
          onClick={props.clickAnchor}
          title="anchor"
        />
        <div
          className={iconCss(props.expanded ? 'compress' : 'expand-solid', 'auto', 13)}
          onClick={props.toggleExpand}
          title={props.expanded ? 'minimise' : 'maximise'}
        />
        <div
          className={iconCss(props.enabled ?  'eye-slash' :  'eye', 'auto', 16)}
          onClick={props.toggleEnabled}
          title={props.enabled ? 'disable' : 'enable'}
          style={{ paddingTop: 2 }}
        />
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
  expanded: boolean;
  clickAnchor: () => void;
  toggleExpand: () => void;
  toggleEnabled: () => void;
}

const controlsCss = css`
  font-family: Roboto, Arial, sans-serif;

  > .top-right {
    position: absolute;
    right: -10px;
    top: -36px;
    z-index: 2;
    border-radius: 4px 4px 0 0;
    padding: 0 16px 0 16px;
    @media(max-width: 600px) {
      padding-top: 4px;
    }

    display: flex;
    > div:not(:last-child) {
      margin-right: 16px;
    }

    cursor: pointer;
    background: #444;
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
