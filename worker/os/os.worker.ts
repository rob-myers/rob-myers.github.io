import { initializeStore } from './create-store';
import createServices from '@service/create-services';
import { OsWorkerContext, OsWorker } from '@model/os/os.worker.model';
import { osInitializeThunk } from '@store/os/init.os.duck';
import { OsSession } from '@store/os/session.os.duck';
import { persistStore } from 'redux-persist';

const ctxt: OsWorkerContext = self as any;

const service = createServices();
const store = initializeStore(service, ctxt);
const persistor = persistStore(store as any);
persistor.pause();

const dispatch = store.dispatch;
dispatch(osInitializeThunk({}));


console.log({ service, store, persistor });
// TRANSPILE TEST
// const parsed = service.parseSh.parse('echo foo');
// const transpiled = service.transpileSh.transpile(parsed);
// console.log({ parsed, transpiled });

ctxt.addEventListener('message', async (msg) => {
  console.log({ osWorkerReceived: msg });

  switch (msg.key) {
    case 'ping': {
      return ctxt.postMessage({ key: 'pong' });
    }
    case 'line-to-tty': {
      return mutateSession(msg.sessionKey, store, ({ ttyINode }) => {
        if (ttyINode) {
          ttyINode.inputs.push({
            line: msg.line,
            resolve: () => ctxt.postMessage({
              key: 'ack-tty-line',
              sessionKey: msg.sessionKey,
              xtermKey: msg.xtermKey,
            })
          });
          ttyINode.awakenFirstPendingReader();
        }
      });
    }
    case 'sig-term-tty': {
      return mutateSession(msg.sessionKey, store, ({ ttyINode }) => {
        ttyINode?.sendSigTerm();
      });
    }
    case 'ack-xterm-cmds': {
      return mutateSession(msg.sessionKey, store, ({ ttyINode }) => {
        if (ttyINode) {
          Object.keys(ttyINode.resolveLookup).forEach((messageUid) => {
            if (messageUid === msg.messageUid) {
              ttyINode.resolveLookup[messageUid]();
              delete ttyINode.resolveLookup[messageUid];
            }
          });
        }
      });
    }
    case 'update-tty-cols': {
      return mutateSession(msg.sessionKey, store, ({ ttyINode }) => {
        ttyINode?.setColumns(msg.cols);
      });
    }
  }

});

function mutateSession(
  sessionKey: string,
  { getState }: typeof store,
  mutate: (session: OsSession) => void,
) {
  const session = getState().os.session[sessionKey];
  if (session) {
    mutate(session);
  }
}

export default {} as Worker & {new (): OsWorker};
