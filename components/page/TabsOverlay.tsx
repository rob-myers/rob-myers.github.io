import { css } from 'goober';
import classNames from 'classnames';
import { iconCss } from './Icons';

export function TabsOverlay(props: Props) {
  return (
    <div className={controlsCss}>
      <div className="top-right">
        <div
          className={iconCss('anchor-icon', 'auto', 13)}
          onClick={props.clickAnchor}
          title="anchor"
        />
        <div
          className={iconCss(props.expanded ? 'compress' : 'expand-solid', 'auto', 13)}
          onClick={props.toggleExpand}
          title={props.expanded ? 'minimise' : 'maximise'}
        />
        <div
          className={classNames(
            iconCss('circle-xmark', 'auto', 15),
            props.enabled && 'enabled',
          )}
          onClick={props.enabled ? props.toggleEnabled : undefined}
          title={props.enabled ? 'disable' : undefined}
          style={{ position: 'relative', top: 1 }}
        />
      </div>
      {!props.enabled && (
        <div className="central" onClick={props.toggleEnabled}>
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
    top: -40px;
    z-index: 2;
    height: 30px;

    background: white;
    border-radius: 4px 4px 0 0;
    border: 1px solid #888;
    border-bottom-width: 0;
    padding: 0 8px;
    @media(max-width: 600px) {
      padding-top: 2px;
    }

    display: flex;
    line-height: initial;
    align-items: center;
    > div {
      padding: 0 8px;
    }
    > div:last-child:not(.enabled) {
      filter: brightness(70%);
    }

    cursor: pointer;
  }

  > .central {
    position: absolute;
    z-index: 6;
    left: calc(50% - (128px / 2));
    top: calc(50% - 20px);
    
    cursor: pointer;
    color: #ddd;
    background: rgba(0, 0, 0, 0.9);
    padding: 12px 32px;
    border-radius: 4px;
    border: 1px solid #ddd;
    font-size: 1.2rem;
    letter-spacing: 2px;
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
