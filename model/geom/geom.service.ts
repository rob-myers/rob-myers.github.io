import { GeomWorker, awaitWorker } from '@worker/geom/worker.model';
import { BipartiteGraph, BipartiteEdge } from './bipartite.model';
import { PolygonJson } from './polygon.model';

/**
 * Interfaces with GeomWorker i.e. GeomWorkerService.
 * Also does computation in main thread e.g. raycasting inside RectNavGraph.
 */
export class GeomService {
  public worker!: GeomWorker;
  private messageIndex = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      import('@worker/geom/geom.worker').then(imported => this.worker = new imported.default);
    }
  }

  async computeRectPartition(polygon: PolygonJson) {
    const polygonKey = `polygon-${this.messageIndex++}`;
    this.worker.postMessage({ key: 'get-rect-decompose', polygon, polygonKey });
    return awaitWorker('send-rect-decompose', this.worker, (msg) => msg.polygonKey === polygonKey);
  }

  async maximalMatching(graph: BipartiteGraph) {
    const graphKey = `graph-${this.messageIndex++}`;
    this.worker.postMessage({ key: 'get-max-matching', graph, graphKey });
    return awaitWorker('send-max-matching', this.worker, (msg) => msg.graphKey === graphKey);
  }

  randomBipartiteGraph(n: number, m: number, p: number) {
    return {
        n,
        m,
        edges: [...Array(n)].reduce((agg, _, i) =>
          agg.concat(...[...Array(m)].map((_, j) => Math.random() < p ? [[i, j]] : []))
        , [] as BipartiteEdge[]),
    };
  }
}
