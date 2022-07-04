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

  export interface NpcAnimMeta {
    animName: string;
    aabb: Geom.Rect;
    frameCount: number;
    /** Aligned to frames i.e. positions of feet contacts (if any) */
    contacts: { left?: Geom.VectJson; right?: Geom.VectJson; }[];
    /**
     * Aligned to frames i.e. how far we move to the right.
     * The 1st number corresponds to transition from last to first.
     */
    deltas: number[];
  }

  export interface NpcAnimCheerio extends NpcAnimMeta {
    defsNode: import('cheerio').Element | null;
    frameNodes: import('cheerio').Element[];
  }
  export interface ParsedNpcCheerio {
    npcName: string;
    animLookup: { [animName: string]: ServerTypes.NpcAnimCheerio };
    /** How much the rendered PNGs have been scaled up. */
    zoom: number;
  }

  export interface ParsedNpc {
    npcName: string;
    animLookup: { [animName: string]: NpcAnimMeta };
    /** How much the rendered PNGs have been scaled up. */
    zoom: number;
  }

}
