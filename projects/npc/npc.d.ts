declare namespace NPC {

  export interface NPCsProps {
    gm: Geomorph.GeomorphData;
    onLoad: ((api: NPC.NPCsApi) => void);
    disabled?: boolean;
  }

  export interface NPCsApi {
    apis: NPCApi[];
    background: HTMLCanvasElement;
    root: HTMLDivElement;
    npcRef: React.RefCallback<HTMLDivElement>;
    rootRef: React.RefCallback<HTMLDivElement>;
    spawn(defs: NPCDef[]): void;
  }

  export interface NPCApi {
    key: string;
    def: NPCDef;
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

  export type NavWire = import('rxjs').Subject<NPC.NavMessage>;

  export type NavMessage = (
    | DoorMessage
  );

  /** Fired when doors is opened-door/closed */
  export interface DoorMessage {
    key: 'opened-door' | 'closed-door';
    index: number;
  }

  export interface DoorsProps {
    gm: Geomorph.GeomorphData;
    wire: NavWire;
    onLoad?: (api: DoorsApi) => void;
  }

  export interface DoorsApi {
    /** Get ids of open doors */
    getOpen(): number[];
    setObservableDoors(doorIds: number[]): void ;
  }

}
