declare namespace Geomorph {
  
  type Poly = import('../geom').Poly;
  type Vect = import('../geom').Vect;

  export interface RenderOpts {
    scale: number;
    obsBounds?: boolean;
    wallBounds?: boolean;
    navTris?: boolean;
    doors?: boolean;
    labels?: boolean;
    floorColor?: string;
    navColor?: string;
  }

  /** Generated via `yarn render-layout` */
  export interface GeomorphJson {
    key: string;
    id: number;
    pngRect: Geom.RectJson;
    doors: DoorJson[];
    navPoly: Geom.GeoJsonPolygon[];
    walls: Geom.GeoJsonPolygon[];
  }

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
    /** Transformed and filtered groups */
    groups: SvgGroups<Poly>;
    /**
     * Currently, the navigable area including doorways.
     */
    navPoly: Poly[];
    walls: Poly[];

    labels: LayoutLabel[];
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
  }

  export interface BrowserLayout {
    dataUrl: string;
    pngRect: Geom.RectJson;
    doors: Geom.TaggedRect[];
    labels: LayoutLabel[];
    pngHref: string;
  }

  export interface LayoutLabel {
    /** Originally specified in symbol svg */
    center: Geom.VectJson;
    /** The label */
    text: string;
    /** World rect containing text */
    rect: Geom.RectJson;
    /** Padded world rect containing text */
    padded: Geom.RectJson;
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
    /** Door tags */
    doors?: string[];
    /** Wall tags */
    walls?: string[];
  }

  export type LayoutKey = (
    | 'g-101--multipurpose'
    | 'g-301--bridge'
    | 'g-302--xboat-repair-bay'
  );

  interface DoorJson extends Geom.AngledRect<RectJson> {
    poly: GeoJsonPolygon;
    seg: [Geom.VectJson, Geom.VectJson];
    tags: string[];
  }

}
