import { ReplaySubject } from 'rxjs';
import type * as THREE from 'three';
import * as portals from 'react-reverse-portal';

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
   * Navmesh recomputation is handled elsewhere i.e.
   * each `Room` talks to the nav webworker.
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

export interface ActorData {
  name: string;
  position: THREE.Vector3;
}

/**
 * Manages actor movement for an environment.
 * We'll mutate this state per animation frame,
 * so it should not be fed into React components.
 */
export interface Director {
  /** Environment key */
  key: string;
  /** Group which contains the actor meshes */
  actorsGrp: THREE.Group;
  /** Actor's meta data */
  actor: KeyedLookup<ActorMeta>;
}

export interface ActorMeta {
  key: string;
  /** Remember actor's mesh */
  mesh: THREE.Mesh;
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
