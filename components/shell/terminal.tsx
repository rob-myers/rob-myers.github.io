import dynamic from 'next/dynamic';
import { TtyXterm } from '@model/shell/tty.xterm';
import { TtyHandler } from '@model/shell/tty.handler';
import XTermComponent from './xterm';
import css from './terminal.scss';

const XTerm = dynamic(() =>
  import('@components/shell/xterm'), { ssr: false }) as typeof XTermComponent;

const Terminal = () => {


  return <XTerm
    className={css.terminal}
    onMount={(xterm) => {
      const ttyId = 1;
      const ttyXterm = new TtyXterm({
        canonicalPath: `/dev/tty-${ttyId}`,
        sessionKey: `root@tty-${ttyId}`,
        linesPerUpdate: 1000,
        refreshMs: 1,
        tty: new TtyHandler(ttyId),
        xterm,
      });
      ttyXterm.initialise();
    }}  
    options={{
      fontSize: 12,
      cursorBlink: true,
      rendererType: 'dom',
      theme: {
        background: 'black',
        foreground: '#41FF00',
      },
    }}
  />;
}

export default Terminal;
