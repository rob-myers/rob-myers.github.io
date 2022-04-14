
declare namespace NPC {
  
  import { KeyedLookup } from 'model/generic.model';
  import { Subject } from 'rxjs';

  export interface Stage {
    key: string;
    /**
     * - Keyboard events sent by `Stage`
     * - Mouse events sent by `Stage`
     */
    event: Subject<
      | StageNpcEvent
      | StagePointerEvent
    >;
    /** The npcs on the stage */
    npc: Record<string, NPC>;
    cleanups: (() => void)[];
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

  type StageNpcEvent = (
    | { key: 'spawn'; npcKey: string; at: Geom.VectJson; }
    | { key: 'spawned'; npcKey: string; at: Geom.VectJson; }
  );

  export interface NPC {
    key: string;
    position: Geom.VectJson;
  }

  export interface NPCsProps {
    disabled?: boolean;
    stageKey: string;
    onLoad: ((api: NPC.NPCsApi) => void);
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

  // OLD BELOW
  ////////////

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

}
