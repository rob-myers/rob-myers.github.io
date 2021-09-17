import React, { useRef, useEffect } from 'react';
import { css } from 'goober';
import classNames from 'classnames';
import { Terminal, ITerminalOptions } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

export default function XTermComponent(props: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal>();

  useEffect(() => {
    const xterm = xtermRef.current = new Terminal(props.options);
   
    // Saw Uncaught Error: This API only accepts integers
    const fitAddon = new FitAddon;
    xterm.loadAddon(fitAddon);
    function onResize() { try { fitAddon.fit(); } catch {} };
    window.addEventListener('resize', onResize);
    
    xterm.open(containerRef.current!);
    // xterm.focus();
    onResize();
    props.onMount(xterm);

    return () => {
      window.removeEventListener('resize', onResize);
      xterm.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={classNames("scrollable", rootCss)}
      onKeyDown={stopKeysPropagating}
    />
  );
};

interface Props {
  onMount: (xterm: Terminal) => void;
  options?: ITerminalOptions;
}

const rootCss = css`
  height: inherit;
  > div {
    width: 100%;
    padding: 4px;
  }
`;

function stopKeysPropagating(e: React.KeyboardEvent) {
  e.stopPropagation();
}
