import { persistStore } from 'redux-persist';
import { initializeStore } from './create-store';
import createServices from '@os-service/create-services';
import { OsWorkerContext, OsWorker } from '@model/os/os.worker.model';
import { osInitializeThunk, osStorePingAct } from '@store/os/init.os.duck';
import { OsSession, osCreateSessionThunk, osEndSessionThunk } from '@store/os/session.os.duck';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { ProcessSignal } from '@model/os/process.model';

const ctxt: OsWorkerContext = self as any;

const service = createServices();
const store = initializeStore(service, ctxt);
const dispatch = store.dispatch as OsDispatchOverload;

const persistor = persistStore(store as any, null, () => {
  // Invoked after rehydration
  dispatch(osInitializeThunk({}));
  ctxt.postMessage({ key: 'worker-os-ready' });
});
persistor.pause(); // We save manually

ctxt.addEventListener('message', async ({ data: msg }) => {
  // console.log({ osWorkerReceived: msg });

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
        ttyINode?.inputs.push({
          line: msg.line,
          resolve: () => ctxt.postMessage({
            key: 'tty-received-line',
            sessionKey: msg.sessionKey,
            uiKey: msg.xtermKey,
          })
        });
        ttyINode?.awakenFirstPendingReader();
      });
    }
    case 'send-tty-signal': {
      // received signal from xterm
      return mutateSession(msg.sessionKey, store, ({ ttyINode }) => {
        if (msg.signal === ProcessSignal.INT) {
          ttyINode?.sendSigInt();
        }
      });
    }
    case 'xterm-received-lines': {
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
    case 'request-history-line': {
      mutateSession(msg.sessionKey, store, ({ ttyINode }) => {
        const { line, nextIndex } = ttyINode!.def.historyINode.getLine(msg.historyIndex);
        ctxt.postMessage({
          key: 'send-history-line',
          sessionKey: msg.sessionKey,
          line,
          nextIndex,
        });
      });
      break;
    }
    case 'save-os': {
      persistor.persist();
      // Trigger persist
      dispatch(osStorePingAct({ pingedAtMs: Date.now() }));
      persistor.pause();
      break;
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
  return session;
}

export default {} as Worker & {new (): OsWorker};
