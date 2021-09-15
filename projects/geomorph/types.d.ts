declare namespace Geomorph {
  
  type Poly = import('../geom').Poly;

  /** Generated via `yarn svg-meta`. */
  export type SvgJson = Record<string, ParsedSymbol<Geom.GeoJsonPolygon>>;

  /** Parsed version of `SvgJson`  */
  export type SymbolLookup = Record<string, ParsedSymbol<Poly>>;

  /**
   * - `ParsedSymbol<GeoPolyJson>` used in `SvgJson`
   * - `ParsedSymbol<Poly>` used in `SymbolLookup`
   */
   export interface ParsedSymbol<T> extends SvgGroups<T> {
    key: string;
    /** Hull walls, only in hull */
    hull: T[];
    pngRect: Geom.RectJson;
  }

  interface SvgGroups<T> {
    singles: { tags: string[]; poly: T }[];
    obstacles: T[];
    walls: T[];
  }

  /**
   * Constructed from `LayoutDef` and `SymbolLookup`.
   */
  export interface Layout {
    def: LayoutDef;
    /** Original geomorph (debug only) */
    pngHref: string;
    /** Bounds of hull */
    hullRect: Geom.RectJson;
    /** Top of hull (sans windows/doors) */
    hullTop: Poly[];

    /** First item is hull symbol */
    symbols: {
      key: string;
      pngHref: string;
      pngRect: Geom.RectJon;
      transformArray?: LayoutDefItem['transform'];
      transform?: string;
    }[];

    /** Transformed and filtered */
    actual: SvgGroups<Poly>;
    navPoly: Poly[];
  }

  export interface LayoutWithLayers extends Layout {
    overlay: string;
    underlay: string;
  }

  export interface LayoutDef {
    /**
     * Corresponds to basename of original PNG,  e.g.
     * `g-301--bridge` where public/debug/g-301--bridge.png exists.
     */
    key: string;
    id: number;
    items: LayoutDefItem[];
  }

  export interface LayoutDefItem {
    symbol: string;
    transform?: [number, number, number, number, number, number];
    tags?: string[];
  }

}
