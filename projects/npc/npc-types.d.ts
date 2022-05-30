
declare namespace NPC {
  
  import { filter, first, map, take } from 'rxjs/operators';
  import { otag } from '../service/rxjs';
  
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
    spawnedAt: number;
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
      origPath: Geom.Vect[];
      spriteSheet: SpriteSheetKey;
      
      root: Animation;
      body: Animation;
      wayMetas: WayPathMeta[];
      wayTimeoutId: number;
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
      opts?: { doorMetas?: NavPathDoorMeta[]; },
    ): Promise<void>;
    /** Radians */
    getAngle(): number;
    getAnimDef(): TypeUtil.AnimDef;
    getPosition(): Geom.Vect;
    getTargets(): { point: Geom.VectJson; arriveMs: number }[];
    npcRef(el: HTMLDivElement | null): void;
    startAnimation(): void;
    updateAnimAux(): void;
    setSpritesheet(spriteSheet: SpriteSheetKey): void;
  }

  interface WayPathMeta {
    key: 'enter-door' | 'exit-door';
    length: number;
    ctxt: TraverseDoorCtxt;
  }

  interface NavPathDoorMeta {
    enterIndex: number;
    ctxt: NPC.TraverseDoorCtxt;
  }

  type SpriteSheetKey = (
    | 'idle'
    | 'walk'
  );

  interface TraverseDoorCtxt {
    srcGmId: number;
    srcDoorId: number;
    srcRoomId: number;
    /** Distinct from srcGmId iff hull door */
    dstGmId: number;
    /** Possibly distinct from srcDoorId iff hull door */
    dstDoorId: number;
    dstRoomId: number;
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
    // wire: NavWire;
    initOpen: { [gmId: number]: number[] }
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
    /** World coords */
    srcExit: Geom.Vect;
    dstGmId: number;
    dstDoorId: number;
    dstHullDoorId: number;
    /** World coords */
    dstEntry: Geom.Vect;
    dstRoomId: number;
  }

  export interface NavRoomTransition {
    doorId: number;
    srcRoomId: number;
    dstRoomId: number;
    /** TODO clarify meaning */
    entry: Geom.Vect;
    /** TODO clarify meaning */
    exit: Geom.Vect;
  }

  interface GlobalNavPath {
    key: 'global-nav';
    paths: LocalNavPath[];
    edges: NPC.NavGmTransition[];
  }
  interface LocalNavPath {
    key: 'local-nav';
    gmId: number;
    paths: Geom.Vect[][];
    edges: NPC.NavRoomTransition[];
  }

  export interface FullApi {
    npc: Record<string, NPC.NPC>;
    path: Record<string, { path: Geom.Vect[]; aabb: Rect; }>;
    events: import('rxjs').Subject<NPC.NPCsMessage>;
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

    async awaitPanZoomIdle(): Promise<void>;
    getGlobalNavPath(src: Geom.VectJson, dst: Geom.VectJson): GlobalNavPath;
    getLocalNavPath(gmId: number, src: Geom.VectJson, dst: Geom.VectJson): LocalNavPath;
    getNpcGlobalNav(e: { npcKey: string; point: Geom.VectJson; debug?: boolean }): GlobalNavPath;
    getNpc(e: { npcKey: string }): NPC.NPC;
    getPanZoomApi(): PanZoom.CssApi;
    isPointLegal(p: Geom.VectJson): boolean;
    async npcAct(e: {
      npcKey: string;
      action: NpcActionKey;
    }): Promise<void>;
    spawn(e: { npcKey: string; point: Geom.VectJson }): void;
    toggleDebugPath(e: { pathKey: string; points?: Geom.VectJson[] }): void;
    trackNpc(e: { npcKey: string }): { subscription: import('rxjs').Subscription; setPaused(next: boolean): void };
    async panZoomTo(e: { zoom?: number; point?: Geom.VectJson; ms: number; easing?: string }): Promise<'cancelled' | 'completed'>;
    async walkNpc(e: { npcKey: string } & (
      | { points: Geom.VectJson[] }
      | GlobalNavPath
      | LocalNavPath
    )): Promise<void>;
  }

  type NpcActionKey = (
    | 'cancel'
    | 'pause'
    | 'play'
    | 'set-player'
  );

  type NPCsMessage = (
    | { key: 'set-player'; npcKey: string; }
    | { key: 'started-walking'; npcKey: string; }
    | { key: 'stopped-walking'; npcKey: string; }
    | { key: 'entered-room'; npcKey: string; ctxt: TraverseDoorCtxt; }
    | { key: 'exited-room'; npcKey: string; ctxt: TraverseDoorCtxt; }
  );

}
