import React, { useState } from 'react';
import { css } from 'goober';
import classNames from 'classnames';
import * as Lookup from 'model/tabs-lookup';
import { Loadable } from 'components/dynamic';

export default function Tab({ children }: Props) {
  const [fadeOut, setFadeOut] = useState(false);
  return (
    <>
      <LoadingOverlay fadeOut={fadeOut} />
      <Loadable onLoaded={() => setFadeOut(true)}>
        {children}
      </Loadable>
    </>
  );
}

type Props = React.PropsWithChildren<{}>

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
    padding: 8px 12px;
    font-size: 14px;
  }

  opacity: 1;
  transition: opacity 0.5s linear;
  &.fade-out {
    opacity: 0;    
  }
`;

export function ErrorMessage({ children }: React.PropsWithChildren<{}>) {
  return (
    <section>
      <strong>{children}</strong>
    </section>
  );
}

export type TabMeta = (
  | { key: 'code'; filepath: Lookup.CodeFilepathKey; folds?: CodeMirror.Position[] }
  | { key: 'component'; filepath: Lookup.ComponentFilepathKey }
);