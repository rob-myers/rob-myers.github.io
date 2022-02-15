declare namespace NPC {

  export type NavWire = import('rxjs').Subject<NPC.NavMessage>;

  export type NavMessage = (
    | DoorMessage
  );

  export interface LightsProps {
    json: Geomorph.GeomorphJson;
    lights: Geom.LightDef[];
    wire: NavWire;
  }

  export interface DoorsProps {
    json: Geomorph.GeomorphJson;
    wire: NavWire;
  }

  /** Fired when doors is opened/closed */
  export interface DoorMessage {
    key: 'opened' | 'closed';
    index: number;
  }

}
