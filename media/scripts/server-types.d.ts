declare namespace ServerTypes {

  export interface FileMeta {
    srcName: string;
    /** Numeric identifier from Starship Geomorphs 2.0 */
    id: number;
    /** Sometimes a range is given */
    ids: number[];
    extendedId?: string;
    /** Dimension in grid squares of Starship Geomorphs 2.0 */
    gridDim: [number, number];
    dstName: string;
    is: string[];
    has: string[];
  }

  export interface FilenameMeta {
    label: string;
    is: string[];
    has: string[];
  }

  export type GeomTagMeta = {
    tags: string[];
    transform?: [number, number, number, number, number, number];
    style: { [key: string]: any };
  } & (
    | { tagName: 'ellipse'; cx: number; cy: number; rx: number; ry: number; }
    | { tagName: 'path'; d: string; }
    | { tagName: 'rect'; } & Geom.RectJson
  );

  export interface NpcAnim {
    animName: string;
    aabb: Geom.Rect;
    frames: NpcAnimFrame[];
  }

  export interface NpcAnimFrame {
    transform: [number, number, number, number, number, number];
    geoms: GeomTagMeta[];
  }

  export interface ParsedNpc {
    npcName: string;
    animLookup: { [animName: string]: ServerTypes.NpcAnim };
    /** How much the rendered PNGs have been scaled up. */
    zoom: number;
  }

}