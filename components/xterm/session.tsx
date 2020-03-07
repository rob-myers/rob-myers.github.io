import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import dynamic from 'next/dynamic';
import { Thunk } from '@store/xterm.duck';
import { redact } from '@model/redux.model';
import { computeXtermKey } from '@model/xterm/xterm.model';
import css from './session.scss';

import XTermComponent from './xterm';
const XTermWithoutSsr: typeof XTermComponent = dynamic(
  () => import('./xterm'),
  { ssr: false },
) as any;

export const Session: React.FC<Props> = ({ uid, userKey }) => {
  const dispatch = useDispatch();
  const sessionKeyRef = useRef<string>();

  useEffect(() => {
    return () => {
      if (sessionKeyRef.current) {
        const xtermKey = computeXtermKey(uid, sessionKeyRef.current);
        dispatch(Thunk.endSession({ xtermKey }));
      }
    };
  }, []);
  
  return (
    <div>
      <div className={css.topPanel}>
        <a
          className={css.saveButton}
          onClick={() => dispatch(Thunk.saveOs({}))}
        >
          save
        </a>
      </div>
      <XTermWithoutSsr
        className={css.terminal}
        onMount={async (xterm) => {
          dispatch(Thunk.createSession({
            uiKey: uid,
            userKey,
            xterm: redact(xterm),
            onCreate: (sessionKey) => sessionKeyRef.current = sessionKey,
          }));
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
      />
    </div>
  );
};

interface Props {
  /** User name to login with. */
  userKey: string;
  /** If other UI closes this, we can tidy away session. */
  uid: string;
}
