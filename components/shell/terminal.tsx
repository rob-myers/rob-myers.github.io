import dynamic from 'next/dynamic';
import { TtyXterm } from '@model/shell/tty.xterm';
import { VirtualTty } from '@model/shell/tty.message';
import XTermComponent from './xterm';
import css from './terminal.scss';

const XTerm = dynamic(
  () => import('@components/shell/xterm'), { ssr: false }) as typeof XTermComponent;

const Terminal = () =>
  <XTerm
    className={css.terminal}
    onMount={(xterm) => {
      const ttyXterm = new TtyXterm({
        canonicalPath: '/dev/tty-1',
        sessionKey: 'tty-1@root',
        linesPerUpdate: 1000,
        refreshMs: 1,
        tty: new VirtualTty(),
        uiKey: 'tty-ui-1',
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

export default Terminal;
