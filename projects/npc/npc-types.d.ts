
declare namespace NPC {

  /** API for a single NPC */
  export interface NPC {
    /** User specified e.g. `andros` */
    key: string;
    /** Epoch ms when spawned */
    epochMs: number;
    /** Definition of NPC */
    def: NPCDef;
    el: {
      root: HTMLDivElement;
      body: HTMLDivElement;
    };
    mounted: boolean;
    anim: NPCAnimData;

    async cancel(): Promise<void>;
    clearWayMetas(): void;
    /** Has respective el ever been animated? On remount this resets. */
    everAnimated(): boolean;
    async followNavPath(
      path: Geom.VectJson[],
      opts?: { globalNavMetas?: NPC.GlobalNavMeta[]; },
    ): Promise<void>;
    /** Radians */
    getAngle(): number;
    getAnimDef(): NpcAnimDef;
    /** Used to scale up how long it takes to move along navpath */
    getAnimScaleFactor(): number;
    getBounds(): Geom.Rect;
    getLineSeg(): null | NpcLineSeg;
    getPosition(): Geom.Vect;
    getRadius(): number;
    getSpeed(): number;
    /**
     * Given duration of upcoming motion,
     * and also `npcWalkAnimDurationMs`,
     * adjust the latter sprite cycle duration
     * to end on a nice frame (avoids flicker).
     */
    getSpriteDuration(nextMotionMs: number): number;
    getTarget(): null | Geom.Vect;
    getTargets(): { point: Geom.Vect; arriveMs: number }[];
    getWalkBounds(): Geom.Rect;
    isWalking(): boolean;
    /** Returns destination angle in radians */
    lookAt(point: Geom.VectJson): number;
    pause(): void;
    play(): void;
    nextWayTimeout(): void;
    npcRef(el: HTMLDivElement | null): void;
    startAnimation(): void;
    setLookTarget(radians: number): void;
    setSpritesheet(spriteSheet: SpriteSheetKey): void;
    updateAnimAux(): void;
    wayTimeout(): void;
  }

  export interface NPCAnimData {
    /** The path we'll walk along */
    path: Geom.Vect[];
    /** Data derived entirely from `anim.path` */
    aux: {
      angs: number[];
      bounds: Geom.Rect;
      edges: ({ p: Geom.Vect; q: Geom.Vect })[];
      elens: number[];
      /** Outset version of `origPath` to detect progress on pause */
      navPathPolys: Geom.Poly[];
      sofars: number[];
      total: number;
    };

    spriteSheet: SpriteSheetKey;
    translate: Animation;
    rotate: Animation;
    sprites: Animation;

    wayMetas: WayPointMeta[];
    wayTimeoutId: number;
  }

  interface NpcLineSeg {
    src: Geom.Vect;
    dst: Geom.Vect;
    tangent: Geom.Vect;
  }

  export interface NpcAnimDef {
    translateKeyframes: Keyframe[];
    rotateKeyframes: Keyframe[];
    opts: KeyframeAnimationOptions & { duration: number };
  }

  type SpriteSheetKey = (
    | 'idle'
    | 'walk'
  );

  export type NavPartition = ({ nodes: Graph.FloorGraphNode[] } & (
    | { key: 'door'; doorId: number; }
    | { key: 'room'; roomId: number; }
  ))[]
  
  export interface NavNodeMeta {
    doorId: number;
    roomId: number;
    nearDoorId?: number;
  }

  export interface NPCDef {
    key: string;
    angle: number;
    /** Initially paused? */
    paused: boolean;
    position: Geom.VectJson;
  }

  export interface DoorMessage {
    key: 'opened-door' | 'closed-door';
    gmId: number;
    doorId: number;
  }

  export interface UseGeomorphsNav {
    pfs: NPC.PfData[];
  }

  export interface PfData {
    graph: Graph.FloorGraph;
  }

  export interface NavGmTransition {
    srcGmId: number;
    srcDoorId: number;
    srcHullDoorId: number;
    srcRoomId: number;
    /**
     * Entrypoint of the hull door from geomorph `srcGmId`,
     * in world coordinates.
     */
    srcDoorEntry: Geom.Vect;
    
    dstGmId: number;
    dstRoomId: number;
    dstDoorId: number;
    dstHullDoorId: number;
    /**
     * Entrypoint of the hull door from geomorph `dstGmId`,
     * in world coordinates.
     */
    dstDoorEntry: Geom.Vect;
  }

  interface GlobalNavPath {
    key: 'global-nav';
    fullPath: Geom.Vect[];
    navMetas: GlobalNavMeta[];
  }

  interface LocalNavPath extends BaseLocalNavPath {
    key: 'local-nav';
    gmId: number;
  }

  interface BaseLocalNavPath {
    fullPath: Geom.Vect[];
    navMetas: LocalNavMeta[];
    /** [startDoorId, endDoorId] respectively, both possibly -1 */
    doorIds: [number, number];
  }

  type LocalNavMeta =
    ({
      /** Pointer into `fullPath` */
      index: number;
    } & (
      | { key: 'enter-room'; enteredRoomId: number; doorId: number; hullDoorId: number; otherRoomId: null | number; }
      | { key: 'exit-room'; exitedRoomId: number; doorId: number; hullDoorId: number; otherRoomId: null | number; }
      | { key: 'pre-collide'; otherNpcKey: string; }
      | { key: 'pre-exit-room'; willExitRoomId: number; doorId: number; hullDoorId: number; otherRoomId: null | number; }
      | { key: 'pre-near-door'; currentRoomId: number; doorId: number; hullDoorId: number; otherRoomId: null | number; }
      | { key: 'start-seg'; }
    ));
  
  type NavMetaKey = LocalNavMeta['key'];

  type GlobalNavMeta = LocalNavMeta & {
    gmId: number;
  }

  type WayPointMeta = GlobalNavMeta & {
    /** Computed via `anim.sofars` */
    length: number;
  }

  export type OnTtyLink = (
    /** The computations are specific to tty i.e. its parent session */
    sessionKey: string,
    /** The "global" 1-based index of "actual" lines ever output by tty */
    outputLineNumber: number,
    lineText: string,
    linkText: string,
    linkStartIndex: number,
  ) => void;

  export interface NpcCollision {
    /**
     * Time when they'll collide,
     * - `iA + (seconds * speed) . tangentA`
     * - `iB + (seconds * speed) . tangentB`
     * 
     * where:
     * - `i{A,B}` are current positions
     * - `speed` in world-units per second
     */
    seconds: number;
    /** Distance from iA at which they will collide */
    distA: number;
    /** Distance from iB at which they will collide */
    distB: number;
  }

  export interface SessionCtxt {
    /** Session key */
    key: string;
    receiveMsgs: boolean;
    tty: { [lineNumber: number]: SessionTtyCtxt[] }
  }

  export type SessionTtyCtxt = {
    lineNumber: number;
    lineText: string;
    /** For example `[foo]` has link text `foo` */
    linkText: string;
    /** Where `linkText` occurs in `lineText` */
    linkStartIndex: number;
  } & (
    | { key: 'room'; gmId: number; roomId: number; }
  )

  type DecorDef = { key: string } & (
    | { type: 'path'; path: Geom.VectJson[]; }
    | { type: 'circle'; center: Geom.VectJson; radius: number; }
  );

  /** Using `action` instead of `key` to avoid name-collision */
  type NpcAction = (
    | { action: 'add-decor'; } & DecorDef
    | { action: 'cancel'; npcKey: string }
    | { action: 'config'; debug?: boolean; interactRadius?: number }
    | { action: 'get'; npcKey: string }
    | { action: 'look-at'; npcKey: string; point: Geom.VectJson }
    | { action: 'pause'; npcKey: string }
    | { action: 'play'; npcKey: string }
    | { action: 'remove-decor'; decorKey: string; }
    | { action: 'rm-decor'; decorKey: string; }
    | { action: 'set-player'; npcKey?: string }
  );

  type NpcActionKey = NpcAction['action'];

  type NPCsEvent = (
    | { key: 'set-player'; npcKey: string | null; }
    | { key: 'spawned-npc'; npcKey: string; }
    | { key: 'started-walking'; npcKey: string; }
    | { key: 'stopped-walking'; npcKey: string; }
    | NPCsWayEvent
    | { key: 'decor'; meta: DecorDef; }
  );

  interface NPCsWayEvent {
    key: 'way-point';
    npcKey: string;
    meta: WayPointMeta;
  }

}
