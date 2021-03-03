import { useRef, useEffect } from 'react';
// https://github.com/farfromrefug/react-xterm/blob/master/src/react-xterm.tsx
import { Terminal, ITerminalOptions } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import styles from 'styles/Terminal.module.css';

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
      className={styles.xtermContainer}
      onKeyDown={stopKeysPropagating}
    />
  );
};

interface Props {
  onMount: (xterm: Terminal) => void;
  options?: ITerminalOptions;
  className?: string;
}

function stopKeysPropagating(e: React.KeyboardEvent) {
  e.stopPropagation();
}

export default XTermComponent;
