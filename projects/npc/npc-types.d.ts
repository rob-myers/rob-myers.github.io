
declare namespace NPC {
  
  // TODO types issue
  import type { filter, first, map, take } from 'rxjs/operators';
  import type { otag } from '../service/rxjs';
  
  export interface NPCsProps {
    disabled?: boolean;
    gmGraph: Graph.GmGraph;
    panZoomApi: PanZoom.CssApi;
    doorsApi: NPC.DoorsApi;
    npcsKey: string;
    onLoad(api: NPC.FullApi): void;
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
    /** Epoch ms */
    epochMs: number;
    /** Definition of NPC */
    def: NPCDef;
    el: {
      root: HTMLDivElement;
      body: HTMLDivElement;
    };

    //#region mutable
    anim: {
      /** Initially `origPath` but may change on pause/unpause */
      animPath: Geom.Vect[];
      /** Data derived from `animPath` */
      aux: {
        angs: number[];
        /** How many times has a new animation been created? */
        count: number;
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
      /**
       * The angle of body when last idle. Carries additional info,
       * i.e. modulus of 2*PI. We use it to ensure we turn the smaller angle.
       */
      lookAngle: number;
    };
    //#endregion

    get paused(): boolean;
    async cancel(): Promise<void>;
    pause(): void;
    play(): void;
    nextWayTimeout(): void;
    wayTimeout(): void;

    async followNavPath(
      path: Geom.VectJson[],
      opts?: { globalNavMetas?: NPC.GlobalNavMeta[]; },
    ): Promise<void>;
    /** Radians */
    getAngle(): number;
    getAnimDef(): NpcAnimDef;
    getBounds(): Geom.Rect;
    getPosition(): Geom.Vect;
    getTargets(): { point: Geom.VectJson; arriveMs: number }[];
    /** Returns destination angle in radians */
    lookAt(point: Geom.VectJson): number;
    npcRef(el: HTMLDivElement | null): void;
    startAnimation(): void;
    updateAnimAux(): void;
    setSpritesheet(spriteSheet: SpriteSheetKey): void;
  }

  export interface NpcAnimDef {
    translateKeyframes: Keyframe[];
    rotateKeyframes: Keyframe[];
    opts: KeyframeAnimationOptions;
  }

  type SpriteSheetKey = (
    | 'idle'
    | 'walk'
  );
  
  export interface NavNodeMeta {
    doorId: number;
    roomId: number;
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
    npcsKey: string;
    onLoad: (api: DoorsApi) => void;
  }

  export interface DoorsApi {
    canvas: HTMLCanvasElement[];
    open: { [doorId: number]: true }[];
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
      | { key: 'exit-room'; exitedRoomId: number; doorId: number; hullDoorId: number; otherRoomId: null | number; }
      | { key: 'pre-exit-room'; willExitRoomId: number; doorId: number; hullDoorId: number; otherRoomId: null | number; }
      | { key: 'enter-room'; enteredRoomId: number; doorId: number; hullDoorId: number; otherRoomId: null | number; }
    ));

  type GlobalNavMeta = LocalNavMeta & {
    gmId: number;
  }

  type WayPointMeta = GlobalNavMeta & {
    /** Computed via `anim.sofars` */
    length: number;
  }

  export interface FullApi {
    npc: Record<string, NPC.NPC>;
    path: Record<string, { path: Geom.Vect[]; aabb: Rect; }>;
    events: import('rxjs').Subject<NPC.NPCsEvent>;
    playerKey: null | string;
    ready: boolean;
    class: {
      Vect: typeof Geom.Vect;
    };
    rxjs: {
      //#region rxjs/operators
      filter: filter;
      first: first;
      map: map;
      take: take;
      //#endregion
      otag: otag;
    };

    getGlobalNavPath(src: Geom.VectJson, dst: Geom.VectJson): GlobalNavPath;
    getLocalNavPath(gmId: number, src: Geom.VectJson, dst: Geom.VectJson): LocalNavPath;
    getNpcGlobalNav(e: { npcKey: string; point: Geom.VectJson; debug?: boolean }): GlobalNavPath;
    getNpc(npcKey: string): NPC.NPC;
    getNpcsIntersecting(convexPoly: Geom.Poly): NPC.NPC[];
    getPanZoomApi(): PanZoom.CssApi;
    getPointTags(point: Geom.VectJson): string[];
    isPointLegal(p: Geom.VectJson): boolean;
    async npcAct(e: NpcAction): Promise<undefined | NPC.NPC>;
    spawn(e: { npcKey: string; point: Geom.VectJson }): void;
    toggleDebugPath(e: { pathKey: string; points?: Geom.VectJson[] }): void;
    trackNpc(e: { npcKey: string; process: import('../sh/session.store').ProcessMeta }): import('rxjs').Subscription;
    async panZoomTo(e: { zoom?: number; point?: Geom.VectJson; ms: number; easing?: string }): Promise<'cancelled' | 'completed'>;
    async walkNpc(e: { npcKey: string } & GlobalNavPath): Promise<void>;
  }

  type NpcAction = (
    | { action: 'cancel'; npcKey: string }
    | { action: 'get'; npcKey: string }
    | { action: 'look-at'; npcKey: string; point: Geom.VectJson }
    | { action: 'pause'; npcKey: string }
    | { action: 'play'; npcKey: string }
    | { action: 'set-player'; npcKey?: string }
  );

  type NpcActionKey = NpcAction['action'];

  type NPCsEvent = (
    | { key: 'set-player'; npcKey: string | null; }
    | { key: 'started-walking'; npcKey: string; }
    | { key: 'stopped-walking'; npcKey: string; }
    | { key: 'way-point'; npcKey: string; meta: WayPointMeta; }
    | { key: 'html'; className: string; html: string | null; point: Geom.VectJson; }
  );

}
