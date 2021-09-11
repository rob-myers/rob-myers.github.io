declare namespace Geomorph {
  
  type Poly = import('../geom').Poly;

  /** Generated by script `svg-meta`. */
  export type SvgJson = Record<string, ParsedSymbol<Geom.GeoJsonPolygon>>;

  /** Parsed version of `SvgJson`  */
  export type SymbolLookup = Record<string, ParsedSymbol<Poly>>;

  /**
   * - `ParsedSymbol<GeoPolyJson>` used in `SvgJson`
   * - `ParsedSymbol<Poly>` used in `SymbolLookup`
   */
  export interface ParsedSymbol<T> {
    key: string;

    /** Only non-empty for hull symbols; assume connected. */
    hull: T[];
    doors: T[];
    irisValves: T[];
    labels: T[];
    obstacles: T[];
    walls: T[];

    meta: {
      /** Door titles */
      doors: (null | string)[];
      /** Only exists for hull symbols */
      hullRect?: Geom.RectJson;
      pngRect: Geom.RectJson;
      svgInnerText?: string; // TODO remove
    };
  }

  /**
   * Constructed from `LayoutDef` and `SymbolLookup`.
   */
  export interface Layout {
    def: LayoutDef;
    /** Transformed and filtered */
    actual: {
      doors: Poly[];
      irisValves: Poly[];
      labels: Poly[];
      obstacles: Poly[];
      walls: Poly[];
    };
    navPoly: Poly[];

    hullKey: string;
    /** Bounds of hull polygon */
    hullRect: Geom.RectJson; // TODO degenerate
    /** Original geomorph (debug only) */
    pngHref: string;
    /** Original geomorph rect (debug only) */
    pngRect: Geom.RectJson;

    /** Includes hull symbol */
    symbols: {
      pngHref: string;
      pngRect: Geom.RectJon;
      transformArray?: LayoutDefItem['transform'];
      transform?: string;
    }[];
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
    hull?: boolean;
    transform?: [number, number, number, number, number, number];
    tags?: string[];
  }

}
