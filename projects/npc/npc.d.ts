declare namespace NPC {

  export type NavWire = import('rxjs').Subject<NPC.NavMessage>;

  export type NavMessage = (
    | DoorMessage
  );

  export interface LightsProps {
    json: Geomorph.GeomorphData;
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

  /** TODO remove (replaced by Geomorph.LightDef) */
  export interface LightDef {
    key: 'light-def';
    /** [position, distance ≥ 0, intensity in [0,1], maskId] */
    def: [Geom.Vect, number, number, 0 | 1];
  }

  /** TODO remove */
  export interface Light {
    key: 'light';
    /** Original index in light defs */
    index: number;
    position: Vect;
    poly: Poly;
    intensity: number;
    radius: number;
  }

  /** TODO remove */
  export interface SvgLight {
    key: 'light';
    /** Original index in light defs */
    index: number;
    intensity: number;
    maskId: 0 | 1;
    position: Vect;
    poly: Poly;
    ratio: Vect;
    r: number;
    scale: Vect;
  }

}
