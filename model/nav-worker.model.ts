import { Poly2Json } from '@model/poly2.model';
import { Rect2Json } from './rect2.model';

export interface NavWorker extends Worker {
  // postMessage(message: NavWorkerMessage, transfer: Transferable[]): void;
  postMessage(message: NavWorkerMessageData): void;
  addEventListener(type: 'message', listener: (message: NavWorkerMessage) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void;
}

interface NavWorkerMessage extends MessageEvent {
  data: NavWorkerMessageData;
}

/**
 * Messages from parent/child thread have suffix ?/!.
 */
type NavWorkerMessageData = (
  | { key: 'ping?' }
  | { key: 'pong!' }
  | {
      key: 'nav-dom?';
      /** Context of computation */
      domUid: string;
      /** World bounds */
      bounds: Rect2Json;
      /** Rectangles in world coords */
      rects: Rect2Json[];
      /** Polygons in world coords */
      polys: Poly2Json[];
    }
  | {
      key: 'nav-dom:outline!';
      /** Context of computation */
      domUid: string;
      /** Navigable multipolygon with triangulation */
      navPolys: Poly2Json[];
    }
  | {
      key: 'nav-dom:refined!';
      /** Context of computation */
      domUid: string;
      /** Refined navigable multipolygon with Steiner points */
      refinedNavPolys: Poly2Json[];
  }
);
