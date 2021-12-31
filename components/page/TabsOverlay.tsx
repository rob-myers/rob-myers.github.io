import { css } from 'goober';
import classNames from 'classnames';
import { iconCss } from './Icons';
import Link from './Link';

export function TabsOverlay(props: Props) {
  return (
    <div className={controlsCss}>
      <div className="top-right">
        {/* 
          TODO use Link here instead
        */}
        <Link
          href={`#${props.parentTabsId}`}
          className={iconCss('anchor-icon-white', 'auto', 13)}
          title="anchor"
        />
        <div
          className={iconCss(props.expanded ? 'compress' : 'expand-solid', 'auto', 13)}
          onClick={props.toggleExpand}
          title={props.expanded ? 'minimise' : 'maximise'}
        />
        <div
          className={classNames(
            'disable-icon',
            iconCss('circle-xmark', 'auto', 16),
            props.enabled && 'enabled',
          )}
          onClick={props.enabled ? props.toggleEnabled : undefined}
          title={props.enabled ? 'disable' : undefined}
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
  parentTabsId: string;
  clickAnchor: () => void;
  toggleExpand: () => void;
  toggleEnabled: () => void;
}

const controlsCss = css`
  font-family: Roboto, Arial, sans-serif;

  > .top-right {
    position: absolute;
    right: -10px;
    top: -38px;
    z-index: 2;
    height: 38px;

    background: #444;
    border-bottom-width: 0;
    padding: 0px 8px;
    @media(max-width: 600px) {
      padding: 0 8px 2px 8px;
    }
    
    display: flex;
    line-height: initial;
    align-items: center;
    > * {
      padding: 0 8px;
    }
    > div.disable-icon {
      position: relative;
      transform: translateY(1.25px);
      @media(max-width: 600px) {
        transform: translateY(2px);
      }
      &:not(.enabled) {
        filter: brightness(70%);
      }
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
