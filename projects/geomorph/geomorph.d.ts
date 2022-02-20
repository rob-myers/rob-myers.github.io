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
    navStroke?: string;
    obsColor?: string;
    wallColor?: string;
  }

  /** Generated via `yarn render-layout` */
  export interface GeomorphJson {
    key: LayoutKey;
    id: number;
    pngRect: Geom.RectJson;
    doors: DoorJson[];
    hull: {
      poly: Geom.GeoJsonPolygon[];
    };
    labels: LayoutLabel[];
    navPoly: Geom.GeoJsonPolygon[];
    navDecomp: Geom.TriangulationJson;
    obstacles: Geom.GeoJsonPolygon[];
    walls: Geom.GeoJsonPolygon[];
  }

  export interface GeomorphData extends GeomorphJson {
    image: HTMLImageElement;
    /** Derived computations (?) */
    d: {
      navPoly: Geom.Poly[];
    };
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
    /** The navigable area including doorways. */
    navPoly: Poly[];
    /** A rich triangulation involving Steiner points */
    navDecomp: Geom.TriangulationJson;
    walls: Poly[];

    labels: LayoutLabel[];

    // TODO group hull

    hullPoly: Geom.Poly[];
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
    key: LayoutKey;
    id: number;
    items: LayoutDefItem[];
  }

  export interface LayoutDefItem {
    symbol: SymbolKey;
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
    | 'g-303--passenger-deck'
  );

  export type SymbolKey = (
    | '101--hull'
    | '301--hull'
    | '302--hull'
    | '303--hull'
    | 'bridge--042--8x9'
    | 'console--018--1x1'
    | 'console--022--1x2'
    | 'console--031--1x1.2'
    | 'empty-room--006--2x2'
    | 'empty-room--013--2x3'
    | 'empty-room--020--2x4'
    | 'empty-room--039--3x4'
    | 'fresher--002--0.4x0.6'
    | 'fresher--020--2x2'
    | 'fresher--025--2x3'
    | 'fuel--010--2x4'
    | 'iris-valves--005--1x1'
    | 'lifeboat--small-craft'
    | 'lounge--009--2x3'
    | 'lounge--015--2x4'
    | 'low-berth--003--1x1'
    | 'machinery--020--1x1.6'
    | 'machinery--091--1.6x1.8'
    | 'machinery--155--1.8x3.6'
    | 'machinery--156--1.8x3.6'
    | 'machinery--158--1.8x3.6'
    | 'machinery--357--2.2x4'
    | 'machinery--077--1.6x1.8'
    | 'medical--007--2x3'
    | 'medical--008--2x3'
    | 'medical-bed--006--1.6x3.6'
    | 'misc-stellar-cartography--023--4x4'
    | 'office--001--2x2'
    | 'office--006--2x2'
    | 'office--020--2x3'
    | 'office--023--2x3'
    | 'office--025--2x3'
    | 'office--026--2x3'
    | 'office--061--3x4'
    | 'office--089--4x4'
    | 'sensors--003--1x1.4'
    | 'ships-locker--011--1x2'
    | 'shop--027--0.4x1.6'
    | 'shop--028--0.8x1.6'
    | 'stateroom--014--2x2'
    | 'stateroom--018--2x3'
    | 'stateroom--019--2x3'
    | 'stateroom--020--2x3'
    | 'stateroom--035--2x3'
    | 'stateroom--036--2x4'
    | 'weaponry--013--1x2'
    | 'window--007--0x2.4'
  );

  interface DoorJson extends Geom.AngledRect<RectJson> {
    poly: GeoJsonPolygon;
    seg: [Geom.VectJson, Geom.VectJson];
    tags: string[];
  }

}
