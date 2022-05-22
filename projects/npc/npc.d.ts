
declare namespace NPC {
  
  import { Subject } from 'rxjs';
  import { filter, first, map, take } from 'rxjs/operators';
  import { otag } from '../service/rxjs';
  
  export interface NPCsProps {
    disabled?: boolean;
    gmGraph: Graph.GmGraph;
    panZoomApi: PanZoom.CssApi;
    doorsApi: NPC.DoorsApi;
    npcsKey: string;
  }

  type WireMessage = (
    | NPC.NpcEvent
    | NPC.PointerEvent
  );

  type PointerEvent = {
    point: Geom.VectJson;
  } & (
    | { key: 'pointerdown' }
    | { key: 'pointerup' }
    | { key: 'pointerleave' }
    | { key: 'pointermove' }
  );

  type NpcEvent = never

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
      enteredSheetAt: number;
      origPath: Geom.Vect[];
      spriteSheet: 'idle' | 'walk';

      root: Animation;
      body: Animation;
    };

    //#endregion
    /** Radians */
    async followNavPath(): Promise<void>;
    getAngle(): number;
    getAnimDef(): TypeUtil.AnimDef;
    getPosition(): Geom.Vect;
    getTargets(): { point: Geom.VectJson; ms: number }[];
    pause(): void;
    updateAnimAux(): void;
  }

  export interface NPCDef {
    key: string;
    angle: number;
    /** Initially paused? */
    paused: boolean;
    position: Geom.VectJson;
  }

  export type NavWire = import('rxjs').Subject<NPC.NavMessage>;

  export type NavMessage = (
    | DoorMessage
  );

  export interface DoorMessage {
    key: 'opened-door' | 'closed-door';
    gmIndex: number;
    index: number;
  }

  export interface DoorsProps {
    gms: Geomorph.GeomorphDataInstance[];
    gmGraph: Graph.GmGraph;
    wire: NavWire;
    initOpen: { [gmId: number]: number[] }
    onLoad: (api: DoorsApi) => void;
  }

  export interface DoorsApi {
    getVisible(gmIndex: number): number[];
    getClosed(gmIndex: number): number[];
    /** Get ids of open doors */
    getOpen(gmIndex: number): number[];
    get ready(): boolean;
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
    srcHullDoorId: number;
    // srcDoorId: number;
    /** World coords */
    srcExit: Geom.Vect;
    dstGmId: number;
    dstHullDoorId: number;
    // dstDoorId: number;
    /** World coords */
    dstEntry: Geom.Vect;
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
    debugPath: Record<string, { path: Geom.Vect[]; aabb: Rect; }>;

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
    async moveNpcAlongPath(npc: NPC.NPC, path: Geom.VectJson[]): Promise<void>;
    npcAct(e: { npcKey: string; action: 'stop' | 'pause' | 'resume' }): void;
    npcRef(el: HTMLDivElement | null): void;
    spawn(e: { npcKey: string; point: Geom.VectJson }): void;
    toggleDebugPath(e: { pathKey: string; points?: Geom.VectJson[] }): void;
    async panZoomTo(e: { zoom?: number; point?: Geom.VectJson; ms: number; easing?: string }): Promise<'cancelled' | 'completed'>;
    async walkNpc(e: { npcKey: string } & (
      | { points: Geom.VectJson[] }
      | GlobalNavPath
      | LocalNavPath
    )): Promise<void>;
  }

}
