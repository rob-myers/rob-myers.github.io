declare namespace Geomorph {
  
  type Poly = import('../geom').Poly;
  type Vect = import('../geom').Vect;

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
    /** Bounds of hull */
    hullRect: Geom.RectJson;
    /** Top of hull (sans windows/doors) */
    hullTop: Poly[];

    /**
     * Symbol instances i.e. PNGs with transforms.
     * The first is always the hull symbol,
     * whose PNG is the original geomorph,
     * typically only used for debugging.
     */
    items: {
      key: string;
      pngHref: string;
      pngRect: Geom.RectJson;
      transformArray?: LayoutDefItem['transform'];
      transform?: string;
    }[];

    /** Transformed and filtered groups */
    groups: SvgGroups<Poly>;
    navPoly: Poly[];
  }

  export interface BrowserLayout {
    dataUrl: string;
    pngRect: Geom.RectJson;
    doors: Poly[];
    labels: {
      center: Vect;
      text: string;
    }[];
    pngHref: string;
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
