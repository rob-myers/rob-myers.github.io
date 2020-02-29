// https://github.com/farfromrefug/react-xterm/blob/master/src/react-xterm.tsx
import { Terminal, ITerminalOptions } from 'xterm';

import { useRef, useEffect, useState } from 'react';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import { WebLinksAddon } from 'xterm-addon-web-links';

const XTermComponent: React.FC<Props> = ({
  className,
  options,
  onMount,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal>();
  const [, triggerUpdate] = useState();

  useEffect(() => {
    const xterm = new Terminal(options);
    xtermRef.current = xterm;
    const fitAddon = new FitAddon;
    xterm.loadAddon(fitAddon);
    xterm.loadAddon(new SearchAddon);
    xterm.loadAddon(new WebLinksAddon);
    xterm.open(containerRef.current!);
    fitAddon.fit();
    xterm.focus();

    const onResize = () => {
      fitAddon.fit();
      triggerUpdate({});
    };
    window.addEventListener('resize', onResize);

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
      style={{ height: '100%', width: '100%' }}
    />
  );
};

interface Props {
  onMount: (xterm: Terminal) => void;
  options?: ITerminalOptions;
  className?: string;
}

export default XTermComponent;
