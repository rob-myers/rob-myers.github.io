import { useRef, useEffect } from 'react';
// https://github.com/farfromrefug/react-xterm/blob/master/src/react-xterm.tsx
import { Terminal, ITerminalOptions } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import styled from '@emotion/styled';

const XTermComponent: React.FC<Props> = ({
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
      // Saw Uncaught Error: This API only accepts integers
      try { fitAddon.fit(); } catch (e) {}
    };
    window.addEventListener('resize', onResize);
    onResize();

    onMount(xterm, fitAddon);

    return () => {
      window.removeEventListener('resize', onResize);
      xterm.dispose();
    };
  }, []);

  return (
    <XTermContainer
      ref={containerRef}
      onKeyDown={stopKeysPropagating}
    />
  );
};

interface Props {
  onMount: (xterm: Terminal, fitAddon: FitAddon) => void;
  options?: ITerminalOptions;
}

const XTermContainer = styled.section<{}>`
  height: inherit;

  > div {
    width: 100%;
    padding: 4px;
  }
`;

function stopKeysPropagating(e: React.KeyboardEvent) {
  e.stopPropagation();
}

export default XTermComponent;
