import { initializeStore } from './create-store';
import createServices from '@os-service/create-services';
import { OsWorkerContext, OsWorker } from '@model/os/os.worker.model';
import { osInitializeThunk } from '@store/os/init.os.duck';
import { OsSession, osCreateSessionThunk, osEndSessionThunk } from '@store/os/session.os.duck';
import { persistStore } from 'redux-persist';
import { OsDispatchOverload } from '@model/os/os.redux.model';

const ctxt: OsWorkerContext = self as any;

const service = createServices();
const store = initializeStore(service, ctxt);
const persistor = persistStore(store as any);
persistor.pause();

const dispatch = store.dispatch as OsDispatchOverload;
dispatch(osInitializeThunk({}));


console.log({ service, store, persistor });
// TRANSPILE TEST
// const parsed = service.parseSh.parse('echo foo');
// const transpiled = service.transpileSh.transpile(parsed);
// console.log({ parsed, transpiled });

ctxt.addEventListener('message', async ({ data: msg }) => {
  console.log({ osWorkerReceived: msg });

  switch (msg.key) {
    case 'ping': {
      return ctxt.postMessage({ key: 'pong' });
    }
    case 'create-session': {
      const { sessionKey, canonicalPath } = dispatch(osCreateSessionThunk({
        uiKey: msg.uiKey,
        userKey: msg.userKey,
      }));
      ctxt.postMessage({
        key: 'created-session',
        uiKey: msg.uiKey,
        canonicalPath,
        sessionKey,
      });
      return;
    }
    case 'end-session': {
      /**
       * TODO keep track of how many uis are connected
       * and only end session when none left.
       */
      return dispatch(osEndSessionThunk({ sessionKey: msg.sessionKey }));
    }
    case 'line-to-tty': {
      return mutateSession(msg.sessionKey, store, ({ ttyINode }) => {
        if (ttyINode) {
          ttyINode.inputs.push({
            line: msg.line,
            resolve: () => ctxt.postMessage({
              key: 'ack-tty-line',
              sessionKey: msg.sessionKey,
              uiKey: msg.xtermKey,
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
