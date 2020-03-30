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
  const { floors, floydWarshall } = getLevel(levelUid)!;
  const navGraph = NavGraph.from(floors);
 
  // FloydWarshall.from is an expensive computation
  const nextFloydWarshall = floydWarshall || redact(FloydWarshall.from(navGraph));
  dispatch(Act.updateLevel(levelUid, { floydWarshall: nextFloydWarshall }));

  const [nodeCount, edgeCount, areaCount] = [
    navGraph.nodesArray.length,
    navGraph.edgesArray.length / 2, // Number of undirected edges
    navGraph.groupedTris.length,
  ];
  const changed = floydWarshall !== nextFloydWarshall;
  ctxt.postMessage({ key: 'floyd-warshall-ready', levelUid,
    changed,
    nodeCount,
    edgeCount,
    areaCount,
  });

  ctxt.postMessage({ key: 'send-level-nav-rects', levelUid,
    rects: navGraph.rects.map(r => r.json),
  });
}

/**
 * Update navigation i.e. triangulation.
 * We also compute a rectangular partition.
 */
export function updateNavGraph(levelUid: string) {
  const { floors, metas } = getLevel(levelUid)!;
  const groupedRects = NavGraph.computeRects(floors);

  /** Steiner points from metas */
  const steiners = Object.values(metas)
    .filter(({ tags }) => tags.includes('steiner'))
    .reduce<{ [polyId: number]: Vector2[] }>((agg, { position: p }) => {
    const polyId = floors.findIndex(floor => floor.contains(p));
    return polyId >= 0 ? { ...agg, [polyId]: (agg[polyId] || []).concat(p) } : agg;
  }, {});

  /**
   * Ensure every point on a rectangle occurs as a NavNode
   * by adding them as Steiner points.
   */
  floors.forEach(({ allPoints }, polyId) => {
    const points = allPoints.concat((steiners[polyId] || []));
    const rectSteiners = groupedRects[polyId].flatMap(x => x.poly2.points)
      .filter((x, i, array) =>
        !points.find(p => p.equals(x)) // hasn't occured before
        && array.findIndex(q => q.equals(x)) === i // remove dups
      );
    steiners[polyId] = (steiners[polyId] || []).concat(rectSteiners);
  });

  floors.forEach((poly, polyId) => {
    poly.removeSteiners();
    if (steiners[polyId]?.length) {
      poly.addSteiners(steiners[polyId]).customTriangulate(0.01);
    } else {
      poly.customTriangulate();
    }
  });

  ctxt.postMessage({ key: 'send-level-tris', levelUid, 
    tris: floors.flatMap(x => x.triangulation).map(({ json }) => json),
  });

  ctxt.postMessage({ key: 'send-level-nav-rects', levelUid,
    rects: groupedRects.flatMap(x => x).map(r => r.json),
  });

  // Clear ephemeral
  dispatch(Act.clearLevelAux(levelUid));
  sendLevelAux(levelUid);
  sendMetas(levelUid);
}
