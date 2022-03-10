declare namespace NPC {

  export type NavWire = import('rxjs').Subject<NPC.NavMessage>;

  export type NavMessage = (
    | DoorMessage
  );

  export interface DoorsProps {
    gm: Geomorph.GeomorphData;
    wire: NavWire;
    onLoad?: (api: DoorsApi) => void;
  }

  /** Fired when doors is opened-door/closed */
  export interface DoorMessage {
    key: 'opened-door' | 'closed-door';
    index: number;
  }

  export interface DoorsApi {
    getOpen(): { [doorIndex: number]: true };
    setObservableDoors(doorIds: number[]): void ;
  }

}
