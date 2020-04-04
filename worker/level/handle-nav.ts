import { LevelDispatchOverload } from '@model/level/level.redux.model';
import { LevelWorkerContext } from '@model/level/level.worker.model';
import { Act } from '@store/level/level.duck';
import { redact } from '@model/redux.model';
import { NavGraph } from '@model/nav/nav-graph.model';
import { FloydWarshall } from '@model/nav/floyd-warshall.model';
import { Vector2 } from '@model/vec2.model';
import { store, getLevel } from './create-store';
import { sendLevelAux, sendMetas } from './handle-requests';

const ctxt: LevelWorkerContext = self as any;
const dispatch = store.dispatch as LevelDispatchOverload;

export function ensureFloydWarshall(levelUid: string) {
  const { floors, floydWarshall: prevFloydWarshall } = getLevel(levelUid)!;
  const metaSteiners = getMetaSteiners(levelUid);
  const navGraph = NavGraph.from(floors, metaSteiners);
 
  // FloydWarshall.from is an expensive computation
  const floydWarshall = prevFloydWarshall || redact(FloydWarshall.from(navGraph));
  dispatch(Act.updateLevel(levelUid, { floydWarshall }));

  const [nodeCount, edgeCount, areaCount] = [
    navGraph.nodesArray.length,
    navGraph.edgesArray.length / 2, // Number of undirected edges
    navGraph.groupedTris.length,
  ];
  ctxt.postMessage({ key: 'floyd-warshall-ready', levelUid,
    changed: prevFloydWarshall !== floydWarshall,
    nodeCount,
    edgeCount,
    areaCount,
  });
  ctxt.postMessage({ key: 'send-level-nav-rects', levelUid,
    rects: navGraph.rects.map(r => r.json),
  });
}

/** Steiner points from metas */
function getMetaSteiners(levelUid: string) {
  const { floors, metaGroups } = getLevel(levelUid)!;
  return  Object.values(metaGroups)
    .filter((metaGroup) => metaGroup.hasTag('steiner'))
    .reduce<{ [polyId: number]: Vector2[] }>((agg, { position: p }) => {
    const polyId = floors.findIndex(floor => floor.contains(p));
    return polyId >= 0 ? { ...agg, [polyId]: (agg[polyId] || []).concat(p) } : agg;
  }, {});
}

/**
 * Update navigation i.e. triangulation.
 * We also compute a rectangular partition.
 */
export function updateNavGraph(levelUid: string) {
  const { floors } = getLevel(levelUid)!;

  /**
   * Build NavGraph using polys and steiner metas.
   * We'll mutate the polys by adding steiner points.
   */
  const metaSteiners = getMetaSteiners(levelUid);
  const navGraph = NavGraph.from(floors, metaSteiners);
  dispatch(Act.updateLevel(levelUid, { navGraph: redact(navGraph) }));

  floors.forEach((poly) => poly.customTriangulate(0.01));
  
  ctxt.postMessage({
    key: 'send-level-tris',
    levelUid, 
    tris: floors.flatMap(x => x.triangulation).map(({ json }) => json),
  });
  ctxt.postMessage({
    key: 'send-level-nav-rects',
    levelUid,
    rects: navGraph.groupedRects.flatMap(x => x).map(r => r.json),
  });

  // Clear ephemeral
  dispatch(Act.clearLevelAux(levelUid));
  sendLevelAux(levelUid);
  sendMetas(levelUid);
}
