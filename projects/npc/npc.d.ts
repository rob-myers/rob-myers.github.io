declare namespace NPC {

  import { Subject } from 'rxjs';

  export interface NPCsProps {
    onLoad: ((api: NPC.NPCsApi) => void);
    disabled?: boolean;
    stageKey: string;
  }

  export interface NPCsApi {
    apis: NPCApi[];
    root: HTMLDivElement;
    npcRef: React.RefCallback<HTMLDivElement>;
    rootRef: React.RefCallback<HTMLDivElement>;
    spawn(defs: NPCDef[]): void;
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

  export type NavWire = import('rxjs').Subject<NPC.NavMessage>;

  export type NavMessage = (
    | DoorMessage
  );

  /** Fired when doors is opened-door/closed */
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

  export interface Stage {
    key: string;
    /** Keyboard events sent by `Stage` */
    npcEvent: Subject<StageNpcEvent>;
    /** Mouse events sent by `Stage` */
    ptrEvent: Subject<StagePointerEvent>;
  }
  
  type StagePointerEvent = {
    /** Position on ground */
    point: Geom.VectJson;
  } & (
    | { key: 'pointerdown' }
    | { key: 'pointerup' }
    | { key: 'pointerleave' }
    | { key: 'pointermove' }
  );

  type StageNpcEvent = {
    npcKey: string;
  } & (
    | { key: 'spawn'; at: Geom.VectJson; }
  );

}
