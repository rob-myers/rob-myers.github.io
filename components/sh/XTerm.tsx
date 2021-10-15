import React, { useRef, useEffect } from 'react';
import { css } from 'goober';
import classNames from 'classnames';
import { Terminal, ITerminalOptions } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import useMeasure from 'react-use-measure';

export default function XTermComponent(props: Props) {
  const containerRef = useRef<HTMLDivElement>();
  const xtermRef = useRef<Terminal>();
  const resizeRef = useRef<() => void>();
  const [measureRef, size] = useMeasure({ debounce: { scroll: 50, resize: 0 } });

  useEffect(() => {
    const xterm = xtermRef.current = new Terminal(props.options);
   
    // Saw Uncaught Error: This API only accepts integers
    const fitAddon = new FitAddon;
    xterm.loadAddon(fitAddon);
    resizeRef.current = () => { try { fitAddon.fit(); } catch {} };
    window.addEventListener('resize', resizeRef.current);
    
    xterm.open(containerRef.current!);
    resizeRef.current();
    props.onMount(xterm);
    // xterm.focus();

    return () => {
      window.removeEventListener('resize', resizeRef.current!);
      xterm.dispose();
    };
  }, []);

  useEffect(() => void resizeRef.current?.(), [size]);

  return (
    <div
      ref={(el) => {
        measureRef(el);
        containerRef.current = el || undefined;
      }}
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
  }
`;

function stopKeysPropagating(e: React.KeyboardEvent) {
  e.stopPropagation();
}
