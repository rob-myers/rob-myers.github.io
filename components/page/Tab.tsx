import React, { useState } from 'react';
import { css } from 'goober';
import classNames from 'classnames';
import * as Lookup from 'model/tabs-lookup';
import { Loadable } from 'components/dynamic';

export default function Tab({ children, background }: Props) {
  const [fadeOut, setFadeOut] = useState(false);

  return (
    <div className={rootCss} style={{ background }}>
      <LoadingOverlay fadeOut={fadeOut} />
      <Loadable onLoaded={() => setFadeOut(true)}>
        {children}
      </Loadable>
    </div>
  );
}

type Props = React.PropsWithChildren<{ background?: string }>

const rootCss = css`
  height: 100%;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-top: 6px solid #444;
  position: relative;
  /** Handle svg overflow */
  overflow: hidden;
`;

function LoadingOverlay(props: { fadeOut: boolean }) {
  return (
    <section className={classNames(overlayCss, { 'fade-out': props.fadeOut })}>
      <div>
        <div className="message">Loading...</div>
      </div>
    </section>
  );
}

const overlayCss = css`
  pointer-events: none;
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
    color: #ccc;
    background: #444;
    border-radius: 4px;
    padding: 8px;
    font-size: 14px;
  }

  opacity: 1;
  transition: opacity 0.5s linear;
  &.fade-out {
    opacity: 0;    
  }
`;

export type TabMeta = (
  | { key: 'code'; filepath: Lookup.CodeFilepathKey; folds?: CodeMirror.Position[] }
  | { key: 'component'; filepath: Lookup.ComponentFilepathKey }
);

export function ErrorMessage({ children }: React.PropsWithChildren<{}>) {
  return (
    <section>
      <strong>{children}</strong>
    </section>
  );
}
