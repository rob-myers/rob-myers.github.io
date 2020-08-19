import { GeomWorker, awaitWorker } from '@worker/geom/worker.model';
import { BipartiteGraph, BipartiteEdge } from './bipartite.model';
import { PolygonJson } from './polygon.model';
import { NavInput } from './rect-nav.model';

/**
 * Interfaces with GeomWorker i.e. GeomWorkerService.
 * Also does computation in main thread e.g. raycasting inside RectNavGraph.
 */
export class GeomService {
  public worker!: GeomWorker;
  private messageIndex = 0;

  constructor() {}

  async computeNavGraph(navInput: NavInput) {
    const graphKey = `graph-${this.messageIndex++}`;
    this.worker.postMessage({ key: 'get-rect-navgraph', navInput, graphKey });
    return awaitWorker('send-rect-navgraph', this.worker, (msg) => msg.graphKey === graphKey);
  }

  async computeRectPartition(polygon: PolygonJson) {
    const polygonKey = `polygon-${this.messageIndex++}`;
    this.worker.postMessage({ key: 'get-rect-decompose', polygon, polygonKey });
    return awaitWorker('send-rect-decompose', this.worker, (msg) => msg.polygonKey === polygonKey);
  }

  /** Must be invoked before accessing worker */
  public async ensureWorker() {
    if (!this.worker && typeof window !== 'undefined') {
      this.worker = new (await import('@worker/geom/geom.worker')).default;
    }
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
