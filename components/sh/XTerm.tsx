import React from 'react';
import { css } from 'goober';
import classNames from 'classnames';
import { Terminal, ITerminalOptions } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { withSize } from 'react-sizeme';

export default withSize({ monitorHeight: true, monitorWidth: true })(
  function XTermComponent(props: Props) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const xtermRef = React.useRef<Terminal>();
    const resizeRef = React.useRef<() => void>();

    React.useEffect(() => {
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

    React.useEffect(
      () => void resizeRef.current?.(),
      [props.size?.height, props.size?.width],
    );

    return (
      <div
        ref={containerRef}
        className={classNames("scrollable", rootCss)}
        onKeyDown={stopKeysPropagating}
      />
    );
  }
);

interface Props {
  onMount: (xterm: Terminal) => void;
  options?: ITerminalOptions;
  size: { width?: number; height?: number; };
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
