
declare namespace NPC {
  
  export interface NPCsProps {
    disabled?: boolean;
    gmGraph: Graph.GmGraph;
    panZoomApi: PanZoom.CssApi;
    doorsApi: NPC.DoorsApi;
    npcsKey: string;
    onLoad(api: NPC.NPCs): void;
  }

  type WireMessage = (
    | NPC.NpcEvent
    | NPC.PtrEvent
  );

  type PtrEvent = {
    point: Geom.VectJson;
  } & (
    | { key: 'pointerdown' }
    | { key: 'pointerup' }
    | { key: 'pointerleave' }
    | { key: 'pointermove' }
  );

  type NpcEvent = never

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

    //#region mutable
    anim: {
      /** The path we'll walk along */
      path: Geom.Vect[];
      /** Data derived entirely from `anim.path` */
      /** How many times has a new animation been created? */
      count: number;
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
    };
    //#endregion

    async cancel(): Promise<void>;
    clearWayMetas(): void;
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
    gmIndex: number;
    index: number;
  }

  export interface DoorsProps {
    gms: Geomorph.GeomorphDataInstance[];
    gmGraph: Graph.GmGraph;
    initOpen: { [gmId: number]: number[] }
    playerNearDoor: (gmId: number, doorId: number) => boolean;
    safeToCloseDoor: (gmId: number, doorId: number) => boolean;
    onLoad: (api: DoorsApi) => void;
  }

  export interface DoorsApi {
    canvas: HTMLCanvasElement[];
    /** open[gmId][doorId] */
    open: boolean[][];
    vis: { [doorId: number]: true }[];
    rootEl: HTMLDivElement;
    onToggleDoor(e: PointerEvent): void;
    drawInvisibleInCanvas(gmId: number): void;

    events: import('rxjs').Subject<NPC.DoorMessage>;
    ready: boolean;
    getVisible(gmIndex: number): number[];
    getClosed(gmIndex: number): number[];
    /** Get ids of open doors */
    getOpen(gmIndex: number): number[];
    setVisible(gmIndex: number, doorIds: number[]): void ;
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

  export interface NPCs {
    decor: Record<string, Decor>;
    events: import('rxjs').Subject<NPC.NPCsEvent>;
    npc: Record<string, NPC.NPC>;
    rootEl: HTMLElement;
    ready: boolean;
    playerKey: null | string;
    session: { [sessionKey: string]: NPC.SessionCtxt };

    class: {
      Vect: typeof Geom.Vect;
    };
    rxjs: {
      //#region rxjs/operators
      filter: import('../service/rxjs').filter;
      first: import('../service/rxjs').first;
      map: import('../service/rxjs').map;
      take: import('../service/rxjs').take;
      //#endregion
      otag: import('../service/rxjs').otag;
    };

    /** Assume each `ctxts[i].lineNumber` is `lineNumber`  */
    addTtyLineCtxts(sessionKey: string, lineNumber: number, ctxts: NPC.SessionTtyCtxt[]): void;
    cleanSessionCtxts(): void;
    detectCollision(npcA: NPC.NPC, npcB: NPC.NPC): null | {
      /**
       * Time in seconds from now when we'll collide,
       * - `initPosA + (collideAt * speed) . tangentA`
       * - `initPosB + (collideAt * speed) . tangentB`
       * 
       * where:
       * - `initPos{A,B}` are current positions
       * - `speed` in world-units per second
       */
      seconds: number;
      /** Distance from initPosA at which we will collide */
      distA: number;
      /** Distance from initPosB at which we will collide */
      distB: number;
      // ...
    };
    getGlobalNavPath(src: Geom.VectJson, dst: Geom.VectJson): GlobalNavPath;
    getGmGraph(): Graph.GmGraph;
    getLocalNavPath(gmId: number, src: Geom.VectJson, dst: Geom.VectJson): LocalNavPath;
    getNpcGlobalNav(e: { npcKey: string; point: Geom.VectJson; debug?: boolean }): GlobalNavPath;
    getNpcInteractRadius(): number;
    getNpc(npcKey: string): NPC.NPC;
    getNpcsIntersecting(convexPoly: Geom.Poly): NPC.NPC[];
    getPlayer(): null | NPC.NPC;
    getPanZoomApi(): PanZoom.CssApi;
    getPointTags(point: Geom.VectJson): string[];
    isPointLegal(p: Geom.VectJson): boolean;
    async npcAct(e: NpcAction): Promise<undefined | NPC.NPC>;
    /**
     * @param {string} sessionKey The computations are specific to tty i.e. its parent session.
     * @param {number} outputLineNumber The "global" 1-based index of "actual" lines ever output by tty
     */
    onTtyLink(sessionKey: string, outputLineNumber: number, lineText: string, linkText: string, linkStartIndex: number);
    rootRef(el: null | HTMLDivElement): void;
    spawn(e: { npcKey: string; point: Geom.VectJson }): void;
    setDecor(decorKey: string, decor: null | NPC.Decor): void;
    trackNpc(e: { npcKey: string; process: import('../sh/session.store').ProcessMeta }): import('rxjs').Subscription;
    /** Used by command `view` */
    async panZoomTo(e: { zoom?: number; point?: Geom.VectJson; ms: number; easing?: string }): Promise<'cancelled' | 'completed'>;
    async walkNpc(e: { npcKey: string } & GlobalNavPath): Promise<void>;
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

  type Decor = { key: string } & (
    | { type: 'path'; path: Geom.VectJson[]; }
    | { type: 'circle'; center: Geom.VectJson; radius: number; }
  );

  /** Using `action` as key avoids name-collision */
  type NpcAction = (
    | { action: 'add-decor'; } & Decor
    | { action: 'cancel'; npcKey: string }
    | { action: 'config'; debug?: boolean; interactRadius?: number }
    | { action: 'get'; npcKey: string }
    | { action: 'look-at'; npcKey: string; point: Geom.VectJson }
    | { action: 'pause'; npcKey: string }
    | { action: 'play'; npcKey: string }
    | { action: 'remove-decor'; decorKey: string; }
    | { action: 'set-player'; npcKey?: string }
  );

  type NpcActionKey = NpcAction['action'];

  type NPCsEvent = (
    | { key: 'set-player'; npcKey: string | null; }
    | { key: 'spawned-npc'; npcKey: string; }
    | { key: 'started-walking'; npcKey: string; }
    | { key: 'stopped-walking'; npcKey: string; }
    | { key: 'way-point'; npcKey: string; meta: WayPointMeta; }
    | { key: 'decor'; meta: Decor; }
  );

}
