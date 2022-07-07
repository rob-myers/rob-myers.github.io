declare namespace Geomorph {
  
  type Poly = Geom.Poly;
  type PolyJson = Geom.GeoJsonPolygon;
  type Vect = Geom.Vect;

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
    /**
     * Bounds of original image in symbol SVG.
     * May be offset e.g. because doors are centred along edges.
     */
    pngRect: Geom.RectJson;
    /** Since epoch in ms */
    lastModified: number;
  }

  interface SvgGroups<T> {
    singles: SvgGroupsSingle<T>[];
    obstacles: T[];
    walls: T[];
  }

  interface SvgGroupsSingle<T> {
    poly: T;
    tags: string[];
  }

  /**
   * The layout of a single geomorph, 
   * constructed from a `LayoutDef` and the `SymbolLookup`.
   */
  export interface Layout<P, G, V, R> {
    key: LayoutKey;
    id: number;

    def: LayoutDef;
    /** Transformed and filtered groups */
    groups: SvgGroups<P>;

    /** Arise from holes in hull polygon and referenced in `roomGraph`. */
    rooms: P[];
    doors: ConnectorRect<P, V, R>[];
    windows: ConnectorRect<P, V, R>[];
    labels: LayoutLabel[];
    /** The navigable area including doorways. */
    navPoly: P[];
    /** Serializable navigation zone used for pathfinding */
    navZone: Nav.ZoneWithMeta;
    /** Connectivity graph involving rooms and doors */
    roomGraph: G;

    /** Should probably have exactly one polygon */
    hullPoly: P[];
    /** Bounds of hull */
    hullRect: Geom.RectJson;
    /** Top of hull, sans windows/doors */
    hullTop: P[];

    /**
     * Symbol instances i.e. PNGs with transforms.
     * The first is always the hull symbol,
     * whose PNG is the original geomorph,
     * typically only used for debugging.
     */
    items: {
      key: string;
      pngHref: string;
      /** Untransformed */
      pngRect: Geom.RectJson;
      /** If absent use identity transform */
      transformArray?: LayoutDefItem['transform'];
      /** If absent use identity transform */
      transform?: string;
    }[];
  }
  
  export type ParsedLayout = Layout<Poly, Graph.RoomGraph, Geom.Vect, Geom.Rect>;
  export type LayoutJson = Layout<PolyJson, Graph.RoomGraphJson, Geom.VectJson, Geom.RectJson>;

  /**
   * Geomorph.ParsedLayout with derived data.
   * This is the type of useGeomorphData's data.
   */
   export interface GeomorphData extends Geomorph.ParsedLayout {
    roomsWithDoors: Poly[];
    hullDoors: ConnectorRect<Poly, Geom.Vect, Geom.Rect>[];
    hullOutline: Poly;
    pngRect: Geom.Rect;
    relDoorId: Record<number, { doorIds: number[]; windowIds: number[] }>;
    
    /** Points grouped by room */
    point: {
      /** Can specify light position from room through door */
      light: { [doorId?: number]: Vect };
      /** `labels` inside room. */
      labels: LayoutLabel[];
      /** Spawn points inside room. */
      spawn: Vect[];

      default: Vect;
    }[];

    /** Proxy for lazy cached data */
    lazy: {
      /** If multiple nav polys, this is the largest one  */
      roomNavPoly: {
        [roomId: number]: Poly;
      };
    };

    /** Returns -1 if not a hull door */
    getHullDoorId(doorOrId: Geomorph.ParsedConnectorRect | number): number;
    /**
     * `roomId` must reside in non-hull-door's roomIds.
     * Returns -1 if not a hull door.
     */
    getOtherRoomId(doorOrId: Geomorph.ParsedConnectorRect | number, roomId: number): number;
    isHullDoor(doorOrId: Geomorph.ParsedConnectorRect | number): boolean;
  }

  export interface UseGeomorphsDefItem {
    layoutKey: LayoutKey;
    transform?: [number, number, number, number, number, number];
  }

  /**
   * Geomorph.GeomorphData with an associated transform,
   * and various induced data e.g. transformOrigin.
   */
  export interface GeomorphDataInstance extends Geomorph.GeomorphData {
    /** `${gm.key}-[${transform}]` */
    itemKey: string;
    transform: [number, number, number, number, number, number];
    /** For drawing inside <img>s */
    transformOrigin: string;
    transformStyle: string;
    matrix: Geom.Mat;
    inverseMatrix: Geom.Mat;
    /**
     * Sub-rectangle of `600 * 600` grid
     * - "Standard Geomorphs" are `1200 * 1200`
     * - "Edge Geomorphs" are `1200 * 600`
     */
    gridRect: Geom.Rect;
  }

  /**
   * TODO replace by `GeomorphData` if possible.
   */
  export interface BrowserLayout {
    dataUrl: string;
    pngRect: Geom.RectJson;
    doors: Geom.TaggedRect[];
    labels: LayoutLabel[];
    pngHref: string;
  }

  /**
   * Includes measurements for canvas-based
   * debug geomorph rendering. In practice,
   * labels would be should via CSS if at all.
   */
  export interface LayoutLabel {
    /** The label */
    text: string;
    /** Originally specified in symbol svg */
    center: Geom.VectJson;
    /** Index inside `Geomorph['labels']` */
    index: number;
    /** Original `label foo | bar baz` yields `['bar', 'baz']` */
    tags: string[];

    /** Measured world rect containing text */
    rect: Geom.RectJson;
    /** Measured padded world rect containing text */
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
    | 'g-102--research-deck'
    | 'g-301--bridge'
    | 'g-302--xboat-repair-bay'
    | 'g-303--passenger-deck'
  );

  export type SymbolKey = (
    | '101--hull'
    | '102--hull'
    | '301--hull'
    | '302--hull'
    | '303--hull'
    | 'bridge--042--8x9'
    | 'console--018--1x1'
    | 'console--022--1x2'
    | 'console--031--1x1.2'
    | 'couch-and-chairs--006--0.4x2'
    | 'empty-room--006--2x2'
    | 'empty-room--013--2x3'
    | 'empty-room--020--2x4'
    | 'empty-room--039--3x4'
    | 'empty-room--060--4x4'
    | 'fresher--002--0.4x0.6'
    | 'fresher--020--2x2'
    | 'fresher--025--2x3'
    | 'fuel--010--2x4'
    | 'gaming-tables--001--1x2'
    | 'galley-and-mess-halls--006--2x4'
    | 'galley-and-mess-halls--025--2x3'
    | 'iris-valves--005--1x1'
    | 'lifeboat--small-craft'
    | 'lab--018--4x4'
    | 'lounge--009--2x3'
    | 'lounge--015--2x4'
    | 'low-berth--003--1x1'
    | 'machinery--001--0.4x1'
    | 'machinery--020--1x1.6'
    | 'machinery--065--1.8x1.8'
    | 'machinery--091--1.6x1.8'
    | 'machinery--155--1.8x3.6'
    | 'machinery--156--1.8x3.6'
    | 'machinery--158--1.8x3.6'
    | 'machinery--357--2.2x4'
    | 'machinery--077--1.6x1.8'
    | 'medical--007--2x3'
    | 'medical--008--2x3'
    | 'medical-bed--006--1.6x3.6'
    | 'misc-stellar-cartography--020--10x10'
    | 'misc-stellar-cartography--023--4x4'
    | 'office--001--2x2'
    | 'office--004--2x2'
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
    | 'stateroom--012--2x2'
    | 'stateroom--014--2x2'
    | 'stateroom--018--2x3'
    | 'stateroom--019--2x3'
    | 'stateroom--020--2x3'
    | 'stateroom--035--2x3'
    | 'stateroom--036--2x4'
    | 'stateroom--100--3x4'
    | 'table--009--0.8x0.8'
    | 'weaponry--013--1x2'
    | 'window--001--0x1'
    | 'window--007--0x2.4'
  );

  export interface ConnectorRect<P, V, R> extends Geom.AngledRect<R> {
    poly: P;
    /** `poly.rect` i.e. rotated rectangle */
    rect: R;
    seg: [V, V];
    /**
     * Points towards `entries[0]`.
     */
    normal: V;
    tags: string[];
    /**
     * `[id of room infront, id of room behind]`
     * where a room is *infront* if `normal` is pointing towards it.
     * Hull doors have exactly one non-null entry.
     */
    roomIds: [null | number, null | number];
    /**
     * Aligned to `roomIds` i.e. `[infront, behind]`
     * where a room is *infront* if `normal` is pointing towards it.
     */
    entries: [V, V];
  }

  type ParsedConnectorRect = ConnectorRect<Geom.Poly, Geom.Vect, Geom.Rect>;
  type ConnectorRectJson = ConnectorRect<Geom.GeoJsonPolygon, Geom.VectJson, Geom.RectJson>;

}
