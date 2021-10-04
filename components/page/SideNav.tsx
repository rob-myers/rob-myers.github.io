import React from 'react';
import { css } from 'goober';
import classNames from 'classnames';

export default function SideNav() {
  const [open, setOpen] = React.useState(true);

  return (
    <nav
      className={classNames(rootCss, !open && 'closed')}
      onClick={() => setOpen(x => !x)}
    >
      sidenav
    </nav>
  );
}

const rootCss = css`
  color: white;
  background: rgba(0, 0, 0, 0.9);
  cursor: pointer;

  position: fixed;
  left: 0;
  height: 100%;
  z-index: 20;
  width: 120px;

  transition: left 500ms ease;
  &.closed {
    left: -80px;
  }

  padding: 16px;
`;