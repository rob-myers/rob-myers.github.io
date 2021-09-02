import React, { useRef, useEffect } from 'react';
// https://github.com/farfromrefug/react-xterm/blob/master/src/react-xterm.tsx
import { Terminal, ITerminalOptions } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { styled } from 'goober';

export default function XTermComponent({
  options,
  onMount,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal>();

  useEffect(() => {
    const xterm = new Terminal(options);
    xtermRef.current = xterm;
   
    const fitAddon = new FitAddon;
    xterm.loadAddon(fitAddon);
    // Saw Uncaught Error: This API only accepts integers
    const onResize = () => { try { fitAddon.fit(); } catch {} };
    window.addEventListener('resize', onResize);
    
    xterm.open(containerRef.current!);
    xterm.focus();
    onResize();

    onMount(xterm);

    return () => {
      window.removeEventListener('resize', onResize);
      xterm.dispose();
    };
  }, []);

  return (
    <XTermContainer
      ref={containerRef}
      className="scrollable"
      onKeyDown={stopKeysPropagating}
    />
  );
};

interface Props {
  onMount: (xterm: Terminal) => void;
  options?: ITerminalOptions;
}

const XTermContainer = styled('section', React.forwardRef)<{}>`
  height: inherit;

  > div {
    width: 100%;
    padding: 4px;
  }
`;

function stopKeysPropagating(e: React.KeyboardEvent) {
  e.stopPropagation();
}
