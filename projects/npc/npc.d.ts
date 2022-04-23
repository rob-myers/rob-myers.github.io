
declare namespace NPC {
  
  import { Subject } from 'rxjs';
  
  export interface NPCsProps {
    disabled?: boolean;
    gmGraph: Graph.GmGraph;
    panZoomApi: PanZoom.CssExtApi;
    wireKey: string;
  }

  type PointerEvent = {
    point: Geom.VectJson;
  } & (
    | { key: 'pointerdown' }
    | { key: 'pointerup' }
    | { key: 'pointerleave' }
    | { key: 'pointermove' }
  );

  type NpcEvent = (
    | { key: 'spawn'; npcKey: string; at: Geom.VectJson; }
    | { key: 'nav-req'; npcKey: string; dst: Geom.VectJson; }
    | { key: 'nav-res'; npcKey: string; path: Geom.Vect[]; req: (NpcEvent & { key: 'nav-req' }); }
    | { key: 'debug-path'; path: Geom.VectJson[]; pathName: string }
  );

  export interface NPC {
    /** User specified e.g. andros */
    key: string;
    /** Autogenerated e.g. andros-3 */
    uid: string;
    def: NPCDef;
    spriteSheetState: 'idle' | 'walk';
    el: {
      root: HTMLDivElement;
    };
    getPosition(): Geom.Vect;
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
    gms: Geomorph.UseGeomorphsItem[];
    gmGraph: Graph.GmGraph;
    wire: NavWire;
    onLoad: (api: DoorsApi) => void;
  }

  export interface DoorsApi {
    getVisible(gmIndex: number): number[];
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
    position: Geom.VectJson;
    // zoneKey: string;
    // /** Initially paused? */
    // paused: boolean;
    // /** Initial position */
    // src: Geom.VectJson;
    // /** Initial target */
    // dst: Geom.VectJson;
    // /** Initial angle */
    // angle: number;
  }

  export type AnimState = (
    | 'idle'
    | 'walk'
  );

}
