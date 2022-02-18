declare namespace NPC {

  export type NavWire = import('rxjs').Subject<NPC.NavMessage>;

  export type NavMessage = (
    | DoorMessage
  );

  export interface LightsProps {
    json: Geomorph.GeomorphJson;
    defs: LightDef[];
    wire: NavWire;
  }

  export interface DoorsProps {
    json: Geomorph.GeomorphJson;
    wire: NavWire;
  }

  /** Fired when doors is opened-door/closed */
  export interface DoorMessage {
    key: 'opened-door' | 'closed-door';
    index: number;
  }

  export interface LightDef {
    key: 'light-def';
    /** [position, distance ≥ 0, intensity in [0,1]] */
    def: [Geom.Vect, number, number];
  }

  export interface Light {
    key: 'light';
    intensity: number;
    position: Vect;
    poly: Poly;
    ratio: Vect;
    r: number;
    scale: Vect;
  }

}
