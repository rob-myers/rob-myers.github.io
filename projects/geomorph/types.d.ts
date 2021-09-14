declare namespace Geomorph {
  
  type Poly = import('../geom').Poly;

  /** Generated by script `svg-meta`. */
  export type SvgJson = Record<string, ParsedSymbol<Geom.GeoJsonPolygon>>;

  /** Parsed version of `SvgJson`  */
  export type SymbolLookup = Record<string, ParsedSymbol<Poly>>;

  interface SvgGroups<T> {
    singles: { tags: string[]; poly: T }[];
    /** Distinguish from plain walls */
    hull: T[];
    labels: T[];
    obstacles: T[];
    walls: T[];
    /** Distinguish windows from hull */
    windows: T[];
  }

  /**
   * - `ParsedSymbol<GeoPolyJson>` used in `SvgJson`
   * - `ParsedSymbol<Poly>` used in `SymbolLookup`
   */
  export interface ParsedSymbol<T> extends SvgGroups<T> {
    key: string;
    meta: {
      /** Door tags e.g. `["iris", "door-e"]` */
      pngRect: Geom.RectJson;
    };
  }

  /**
   * Constructed from `LayoutDef` and `SymbolLookup`.
   */
  export interface Layout {
    def: LayoutDef;
    /** Transformed and filtered */
    actual: SvgGroups<Poly>;
    navPoly: Poly[];

    /** Top of hull (sans windows/doors) */
    hullTop: Poly[];
    /** Bounds of hull polygon */
    hullRect: Geom.RectJson;
    /** Original geomorph (debug only) */
    pngHref: string;
    /** Original geomorph rect (debug only) */
    pngRect: Geom.RectJson;

    /** First item is hull symbol */
    symbols: {
      key: string;
      pngHref: string;
      pngRect: Geom.RectJon;
      transformArray?: LayoutDefItem['transform'];
      transform?: string;
    }[];
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
