import { ReplaySubject } from 'rxjs';
import type * as THREE from 'three';
import * as portals from 'react-reverse-portal';
import type { useBox } from '@react-three/cannon';

import { FsFile } from '@model/shell/file.model';
import { KeyedLookup } from '@model/generic.model';

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
   * This nested lookup is justified.
   */
  actor: KeyedLookup<ActorMeta>;
}

export interface ActorMeta {
  /** Actor name (unique per env) */
  key: string;
  /** Mesh id */
  id: string;
  /** Mesh instance from `Actor` */
  mesh: THREE.Mesh;
  /** useBox physics from `Actor` */
  physics: ReturnType<typeof useBox>[1];
  /** Physics position updated via subscription */
  position: THREE.Vector3;
  /** Physics rotation updated via subscription */
  rotation: THREE.Euler;
  /** Cancel animation or noop */
  cancel: () => void;
  /** Current timeline used to animate actor */
  timeline: anime.AnimeTimelineInstance;
}

export interface Decorator {
  /** Environment key */
  key: string;
  /** Group containing indicators */
  indicators: THREE.Group;
}
