import { ReplaySubject } from 'rxjs';
import type * as THREE from 'three';
import * as portals from 'react-reverse-portal';

import type * as Geom from '@model/geom/geom.model'
import { FsFile } from '@model/shell/file.model';
import { KeyedLookup } from '@model/generic.model';
import { Steerable } from './steerable';
import { PanZoomControls } from '@model/three/controls';

export interface Env {
  /** Environment key */
  key: string;
  /** Set walls very high? */
  highWalls: boolean;
  /**
   * Originally created in shell.store `Session`.
   * - world can internally write click events to builtins.
   * - builtins can write messages to change the world.
   */
  worldDevice: FsFile;
  /**
   * Messages are sent by `Room`s when they're updated.
   * This triggers shadow recomputation in `World`.
   * Navmesh recomputation handled elsewhere: each `Room`
   * handles its `Inner`s and talks to the nav webworker.
   */
  updateShadows$: ReplaySubject<{ key: 'room-updated' }>;
  /** Supplied by `World`. */
  scene: THREE.Scene;
  camControls: PanZoomControls;
}

export interface EnvDef {
  envKey: string;
  highWalls: boolean;
}

export interface EnvPortal {
  /** Environment key */
  key: string;
  portalNode: portals.HtmlPortalNode;
}

export interface Director {
  /** Environment key */
  key: string;
  /**
   * Actors in this enviroment.
   * They are mutated in situ.
   */
  actor: KeyedLookup<ActorMeta>;
  mouse: {
    /** Last seen 2d position of mouse */
    position: Geom.Vector;
  };
}

export interface ActorMeta {
  /** Actor name (unique per env) */
  key: string;
  /** Mesh id */
  id: string;
  /** Mesh instance from `Actor` */
  mesh: THREE.Mesh;
  lastSpawn: THREE.Vector3;
  steerable: Steerable;
  /** Cancel animation or noop */
  cancelGoto: () => void;
  cancelLook: () => void;
}

export interface Decorator {
  /** Environment key */
  key: string;
  /** Group containing indicators */
  indicators: THREE.Group;
}
