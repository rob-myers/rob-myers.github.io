// https://github.com/farfromrefug/react-xterm/blob/master/src/react-xterm.tsx
import { Terminal, ITerminalOptions } from 'xterm';

import { useRef, useEffect } from 'react';
import { FitAddon } from 'xterm-addon-fit';
// import { SearchAddon } from 'xterm-addon-search';
import { WebLinksAddon } from 'xterm-addon-web-links';

const stopKeysPropagating = (e: React.KeyboardEvent) => {
  e.stopPropagation();
};

const XTermComponent: React.FC<Props> = ({
  className,
  options,
  onMount,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal>();

  useEffect(() => {
    const xterm = new Terminal(options);
    xtermRef.current = xterm;
    const fitAddon = new FitAddon;
    xterm.loadAddon(fitAddon);
    // xterm.loadAddon(new SearchAddon);
    xterm.loadAddon(new WebLinksAddon);
    xterm.open(containerRef.current!);
    xterm.focus();

    const onResize = () => {
      try {// Saw Uncaught Error: This API only accepts integers
        fitAddon.fit();
      } catch (e) {}
    };
    window.addEventListener('resize', onResize);
    onResize();

    onMount(xterm);

    return () => {
      window.removeEventListener('resize', onResize);
      xterm.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      onKeyDown={stopKeysPropagating}
    />
  );
};

interface Props {
  onMount: (xterm: Terminal) => void;
  options?: ITerminalOptions;
  className?: string;
}

export default XTermComponent;
