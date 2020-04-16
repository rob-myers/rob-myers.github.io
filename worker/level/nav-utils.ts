import { LevelDispatchOverload } from '@model/level/level.redux.model';
import { LevelWorkerContext } from '@model/level/level.worker.model';
import { redact } from '@model/redux.model';
import { NavGraph } from '@model/level/nav/nav-graph.model';
import { FloydWarshall } from '@model/level/nav/floyd-warshall.model';
import { Vector2 } from '@model/vec2.model';
import { ViewGraph } from '@model/level/nav/view-graph.model';
import { Act } from '@store/level/level.duck';
import { store, getLevel } from './create-store';
import { sendLevelAux, sendMetas } from './handle-requests';

const ctxt: LevelWorkerContext = self as any;
const dispatch = store.dispatch as LevelDispatchOverload;

export function ensureFloydWarshall(levelUid: string) {
  const { floors, floydWarshall: prevFloydWarshall, metaGroups } = getLevel(levelUid)!;
  const metaSteiners = getMetaSteiners(levelUid);
  const navGraph = NavGraph.from(floors, metaSteiners);
  const viewGraph = ViewGraph.from(floors, Object.values(metaGroups).flatMap(x => x.metas));
 
  // FloydWarshall.from is an expensive computation
  const floydWarshall = prevFloydWarshall || redact(FloydWarshall.from(navGraph, viewGraph));
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

export function getCutRects(levelUid: string) {
  const { metaGroups } = getLevel(levelUid)!;
  return Object.values(metaGroups)
    .flatMap(({ metas }) => metas.filter(({ physical, rect }) => physical === 'cut' && rect))
    .map(({ rect }) => rect!.clone());
}

export function getDoorRects(levelUid: string) {
  const { metaGroups } = getLevel(levelUid)!;
  return Object.values(metaGroups)
    .flatMap(({ metas }) => metas)
    .filter(({ physical, rect }) => physical === 'door' && rect)
    .map(({ rect }) => rect!.clone());
}

export function getHorizVertSegs(levelUid: string) {
  const { metaGroups } = getLevel(levelUid)!;

  return Object.values(metaGroups).reduce((agg, group) =>
    agg.concat(
      group.metas.reduce((agg, meta) => {
        if (meta.physical === 'horiz' && meta.rect) {
          agg.push([meta.rect.topLeft, meta.rect.topRight]);
        } else if (meta.physical === 'vert' && meta.rect) {
          agg.push([meta.rect.topLeft, meta.rect.bottomLeft]);
        }
        return agg;
      }, [] as [Vector2, Vector2][])
    )
  , [] as [Vector2, Vector2][]);
}

/**
 * Compute steiner points from metas.
 */
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
 */
export function updateNavGraph(levelUid: string) {
  const { floors } = getLevel(levelUid)!;
  /**
   * Build NavGraph using polys and steiner metas.
   * NavGraph.from extends `floors` with steiners and re-triangulates.
   */
  const metaSteiners = getMetaSteiners(levelUid);
  const navGraph = NavGraph.from(floors, metaSteiners);
  dispatch(Act.updateLevel(levelUid, { navGraph: redact(navGraph) }));

  ctxt.postMessage({
    key: 'send-level-tris',
    levelUid, 
    tris: floors.flatMap(x => x.triangulation).map(({ json }) => json),
  });
  ctxt.postMessage({
    key: 'send-level-nav-rects',
    levelUid,
    rects: navGraph.rects.map(r => r.json),
  });

  // Clear ephemeral
  dispatch(Act.clearLevelAux(levelUid));
  sendLevelAux(levelUid);
  sendMetas(levelUid);
}
