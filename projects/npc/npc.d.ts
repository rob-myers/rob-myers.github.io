
declare namespace NPC {
  
  import { Subject } from 'rxjs';
  
  export interface NPCsProps {
    disabled?: boolean;
    gmGraph: Graph.GmGraph;
    panZoomApi: PanZoom.CssExtApi;
    doorsApi: NPC.DoorsApi;
    wireKey: string;
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

  type NpcEvent = (
    | { key: 'ping'; }
    | { key: 'pong'; }
    | { key: 'spawn'; npcKey: string; at: Geom.VectJson; }
    | { key: 'npc-req'; npcKey: string; }
    | {
      key: 'npc-res';
      req: (NpcEvent & { key: 'npc-req' });
      res: NPC.NPC;
    }
    | { key: 'walk-req'; npcKey: string; path: Geom.VectJson[]; }
    | {
        key: 'walk-res';
        req: (NpcEvent & { key: 'walk-req' });
        res: Animation;
      }
    | { key: 'nav-req'; npcKey: string; dst: Geom.VectJson; }
    | {
        key: 'nav-res';
        req: (NpcEvent & { key: 'nav-req' });
        res: null | { paths: Geom.Vect[][]; edges: NPC.NavGmTransition[] };
      }
    | { key: 'debug-path'; path: Geom.VectJson[]; pathName: string }
    | { key: 'view-req'; zoom?: number; to?: Geom.VectJson; ms?: number }
    | {
      key: 'view-res';
      req: (NpcEvent & { key: 'view-req' });
      res: 'completed' | 'cancelled';
    }
    | { key: 'panzoom-idle-req' }
    | {
      key: 'panzoom-idle-res';
      req: (NpcEvent & { key: 'panzoom-idle-req' });
      res: true;
    }
    | { key: 'panzoom-focus-req' }
    | {
      key: 'panzoom-focus-res';
      req: (NpcEvent & { key: 'panzoom-focus-req' });
      res: Geom.VectJson;
    }
    | { key: 'classes-req' }
    | {
      key: 'classes-res';
      req: (NpcEvent & { key: 'classes-req' });
      res: { Vect: Vect }
    }
  );

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
    spriteSheet: 'idle' | 'walk';
    origPath: Geom.Vect[];
    /** Initially `origPath` but may change on pause/unpause */
    animPath: Geom.Vect[];
    anim: {
      root: Animation;
      body: Animation;
    };
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

    //#endregion
    /** Radians */
    getAngle(): number;
    getPosition(): Geom.Vect;
    followNavPath(): void;
    pause(): void;
    updateAnimAux(): void;
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
    src: {
      gmId: number;
      hullDoorId: number;
      /** World coords */
      exit: Geom.Vect;
    };
    dst: {
      gmId: number;
      hullDoorId: number;
      /** World coords */
      entry: Geom.Vect;
    };
  }

  export interface NavRoomTransition {
    doorId: number;
    srcRoomId: number;
    dstRoomId: number;
    entry: Geom.Vect;
    exit: Geom.Vect;
  }

  // OLD BELOW
  ////////////

  export interface NPCsPropsOld {
    wireKey: string;
    gmGraph: Graph.GmGraph;
    disabled?: boolean;
    onLoad: ((api: NPC.NPCsApi) => void);
  }

  export interface NPCsApi {
    apis: NPCApi[];
    root: HTMLDivElement;
    npcRef: React.RefCallback<HTMLDivElement>;
    rootRef: React.RefCallback<HTMLDivElement>;
    // spawn(defs: NPCDef[]): void;
  }

  export interface NPCApi {
    key: string;
    def: NPCDef;
    animState: 'idle' | 'walk';
    el: {
      root: HTMLDivElement;
    };
  }

  export interface NPCDef {
    key: string;
    angle: number;
    /** Initially paused? */
    paused: boolean;
    position: Geom.VectJson;
    // zoneKey: string;
    // /** Initial position */
    // src: Geom.VectJson;
    // /** Initial target */
    // dst: Geom.VectJson;
    // /** Initial angle */
  }

  export type AnimState = (
    | 'idle'
    | 'walk'
  );

}
