import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import dynamic from 'next/dynamic';
import { Thunk } from '@store/xterm.duck';
import { redact } from '@model/redux.model';
import { computeXtermKey } from '@model/xterm/xterm.model';

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
    <XTermWithoutSsr
      onMount={(xterm) => {
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
        // bellStyle: 'sound',
        // bellSound: beep29DataUri,
        rendererType: 'dom',
        theme: {
          background: 'black',
          foreground: '#41FF00',
        },
      }}
    />
  );
};

interface Props {
  /** User name to login with. */
  userKey: string;
  /** If other UI closes this, we can tidy away session. */
  uid: string;
}
