import { LevelDispatchOverload } from '@model/level/level.redux.model';
import { LevelWorkerContext } from '@model/level/level.worker.model';
import { Act } from '@store/level/level.duck';
import { OldNavGraph } from '@model/nav/old-nav-graph.model';
import { redact } from '@model/redux.model';
import { OldFloydWarshall } from '@model/nav/old-floyd-warshall.model';
import { store, getLevel } from './create-store';

const ctxt: LevelWorkerContext = self as any;
const dispatch = store.dispatch as LevelDispatchOverload;

export function ensureFloydWarshall(levelUid: string) {
  const { floors, floydWarshall } = getLevel(levelUid)!;
  const navGraph = OldNavGraph.from(floors);
 
  // FloydWarshall.from is an expensive computation
  const nextFloydWarshall = floydWarshall || redact(OldFloydWarshall.from(navGraph));
  dispatch(Act.updateLevel(levelUid, { floydWarshall: nextFloydWarshall }));

  // Divide by 2 for undirected edges
  const [nodeCount, edgeCount, areaCount] = [navGraph.nodesArray.length, navGraph.edgesArray.length / 2, navGraph.groupedTris.length];
  const changed = floydWarshall !== nextFloydWarshall;
  ctxt.postMessage({ key: 'floyd-warshall-ready', levelUid, changed, nodeCount, edgeCount, areaCount });
}
