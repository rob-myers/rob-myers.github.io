import { LevelDispatchOverload } from '@model/level/level.redux.model';
import { LevelWorkerContext } from '@model/level/level.worker.model';
import { Act } from '@store/level/level.duck';
import { redact } from '@model/redux.model';
import { store, getLevel } from './create-store';
import { NavGraph } from '@model/nav/nav-graph.model';
import { FloydWarshall } from '@model/nav/floyd-warshall.model';

const ctxt: LevelWorkerContext = self as any;
const dispatch = store.dispatch as LevelDispatchOverload;

export function ensureFloydWarshall(levelUid: string) {
  const { floors, floydWarshall } = getLevel(levelUid)!;
  const navGraph = NavGraph.from(floors);
 
  // FloydWarshall.from is an expensive computation
  const nextFloydWarshall = floydWarshall || redact(FloydWarshall.from(navGraph));
  dispatch(Act.updateLevel(levelUid, { floydWarshall: nextFloydWarshall }));

  const [nodeCount, edgeCount, areaCount] = [
    navGraph.nodesArray.length,
    // Divide to get undirected edges
    navGraph.edgesArray.length / 2,
    navGraph.groupedTris.length,
  ];
  const changed = floydWarshall !== nextFloydWarshall;
  ctxt.postMessage({ key: 'floyd-warshall-ready', levelUid,
    changed,
    nodeCount,
    edgeCount,
    areaCount,
  });

  // Update rects
  ctxt.postMessage({ key: 'send-level-nav-rects', levelUid,
    rects: navGraph.rects.map(r => r.json),
  });
}
