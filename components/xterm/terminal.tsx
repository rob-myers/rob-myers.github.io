import dynamic from 'next/dynamic';
import { TtyXterm } from '@model/xterm/tty.xterm';
import XTermComponent from '@components/xterm/xterm';
import { VirtualTty } from '@model/xterm/tty.message';
import { redact } from '@model/store/redux.model';
import css from './terminal.scss';

const XTerm = dynamic(
  () => import('@components/xterm/xterm'), { ssr: false }) as typeof XTermComponent;

const Terminal = () =>
  <XTerm
    className={css.terminal}
    onMount={(xterm) => {
      console.log('mounted');
      const ttyXterm = new TtyXterm({
        canonicalPath: '/dev/tty-1',
        sessionKey: 'tty-1@root',
        linesPerUpdate: 1000,
        refreshMs: 1,
        tty: new VirtualTty(),
        uiKey: 'tty-ui-1',
        xterm: redact(xterm),
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
