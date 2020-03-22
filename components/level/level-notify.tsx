import { useToasts, Options as ToastOptions} from 'react-toast-notifications';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { redact } from '@model/redux.model';
import { ReplaySubject } from 'rxjs';
import { ForwardedNotification } from '@model/level/level.model';
import { Act } from '@store/level.duck';
import { testNever } from '@model/generic.model';

const toastOpts = (ms = 3000) => ({
  appearance: 'info',
  autoDismiss: true,
  autoDismissTimeout: ms,
} as ToastOptions);

const LevelNotify: React.FC<{ levelUid: string }> = ({ levelUid }) => {
  const dispatch = useDispatch();
  const { addToast } = useToasts();

  useEffect(() => {
    const notifyForwarder = redact(new ReplaySubject<ForwardedNotification>());
    const sub = notifyForwarder.subscribe((msg) => {
      switch (msg.key) {
        case 'ping': {
          break;
        }
        case 'floyd-warshall-ready': {
          const { nodeCount, edgeCount, areaCount } = msg.orig;
          addToast((<>
            <div>Computed <a target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm">Floyd-Warshall algorithm</a></div>
            <div>{nodeCount} nodes, {edgeCount} edge{edgeCount === 1 ? '' : 's'} over {areaCount} area{areaCount === 1 ? '' : 's'}.</div>
          </>), toastOpts());
          break;
        }
        default: throw testNever(msg);
      }
    });
    dispatch(Act.updateLevel(levelUid, { notifyForwarder }));

    return () => {
      sub.unsubscribe();
      dispatch(Act.updateLevel(levelUid, { notifyForwarder: null }));
    };
  }, []);

  return null;
};


export default LevelNotify;
