import { Subject } from "rxjs";
import { Vector3, Scene } from "three";
import { KeyedLookup, Triple } from "model/generic.model";
import * as Geom from 'model/geom';
import { PanZoomControls } from 'model/3d/pan-zoom-controls';
import { geomService } from "model/geom.service";

export type StageMeta = {
  key: string;
  /** The internals of the stage */
  internal: StageInternal;
  /** Key value store for internal use */
  extra: StageExtra;
  /** Important options the CLI is expected to access */
  opts: StageOpts;
  /** Used to draw rects and copy/cut/paste templates */
  brush: BrushMeta;
  /** Polygon storage */
  polygon: KeyedLookup<NamedPolygons>;
  /** Has keys of polygons representing high walls */
  walls: StageWalls;
  /** World bounds */
  bounds: Geom.Rect;
};

export interface StageInternal {
  /** Keyboard events sent by `Stage`  */
  keyEvents: Subject<StageKeyEvent>;
  /** Previous state of all polygons on stage before an edit */
  prevPolygon: KeyedLookup<NamedPolygons>;
  /** Attached on mount */
  controls?: PanZoomControls;
  /** Attached by Stage */
  scene?: Scene;
}

export type StageExtra = Record<string, any> & {
  /** Data url */
  canvasPreview?: string;
}

/** Keep this flat so stage.proxy handles updates */
export interface StageOpts {
  enabled: boolean;
  /** Can we move/zoom the pan-zoom camera? */
  panZoom: boolean;
  /** Lights enabled? */
  lights: boolean;
  /** CSS background of stage */
  background: string;
  /** Height of walls */
  wallHeight: number;
  /** Color of walls */
  wallColor: string;
  /** Transparency in range [0,1] */
  wallOpacity: number;
  /** Persist on unload window? */
  autoPersist: boolean;
  /** Initial camera position */
  initCameraPos: Triple<number>;
}

export enum CorePolygonKey {
  default = 'default',
  navigable = 'navigable',
  walls = 'walls',
}

export function createPolygonLookup(): StageMeta['polygon'] {
  return {
    [CorePolygonKey.default]: createNamedPolygons(CorePolygonKey.default),
    [CorePolygonKey.navigable]: createNamedPolygons(CorePolygonKey.navigable),
    [CorePolygonKey.walls]: createNamedPolygons(CorePolygonKey.walls),
  };
}

export function createStage(stageKey: string): StageMeta {
  return {
    key: stageKey,
    internal: {
      keyEvents: new Subject,
      prevPolygon: createPolygonLookup(),
      // ... other stuff attached by components
    },
    extra: {},
    opts: createStageOpts(),

    brush: createDefaultBrushMeta(),
    polygon: createPolygonLookup(),
    walls: {
      polygonKeys: [CorePolygonKey.default],
    },
    
    bounds: initStageBounds.clone(),
  };
}

function createStageOpts(): StageOpts {
  return {
    enabled: true,
    lights: true,
    panZoom: true,
    background: 'white',
    wallColor: '#000',
    wallOpacity: 1,
    wallHeight: 2,
    autoPersist: true,
    initCameraPos: [...initCameraPosArray],
  };
}

export interface PersistedStage {
  key: string;
  polygon: KeyedLookup<NamedPolygonsJson>;
  opts: StageOpts;
  extra: StageExtra;
}

export function createPersist(stageKey: string): PersistedStage {
  return {
    key: stageKey,
    polygon: createPolygonLookup(),
    opts: createStageOpts(),
    extra: {},
  };
}

//#region internal
export type StageKeyEvent = Pick<KeyboardEvent,
  'type' | 'key' | 'metaKey' | 'shiftKey'
> & {
  type: 'keydown' | 'keyup';
};

const initCameraPosArray: Triple<number> = [0, 0, 10];

export const initCameraPos = new Vector3(...initCameraPosArray);

export const initStageBounds = new Geom.Rect(-5, -5, 10, 10);

//#endregion

export interface BrushMeta {
  /** The untransformed brush rect */
  baseRect: Geom.Rect;
  /** Mutated by Brush */
  position: Geom.Vector;
  /** Mutated by Brush */
  scale: Geom.Vector;
  /** Key of the polygon the rectangle tool edits */
  rectToolPolygonKey: string;
  /** Is the selection locked? */
  locked: boolean;
  /** Current selection */
  selection: SelectedPolygons[];
  /** Position of brush when last made selection */
  selectFrom: Vector3;
}

export function createDefaultBrushMeta(): BrushMeta {
  return {
    baseRect: new Geom.Rect(0, -1, 1, 1), // ?
    position: new Geom.Vector,
    scale: new Geom.Vector(1, 1),
    rectToolPolygonKey: 'default',
    locked: false,
    selection: [],
    selectFrom: new Vector3,
  };
};

export interface NamedPolygons {
  key: string;
  polygons: Geom.Polygon[];
}

/** Serializable `NamedPolygons` */
export interface NamedPolygonsJson {
  key: string;
  polygons: Geom.PolygonJson[];
}

export function createNamedPolygons(key: string): NamedPolygons {
  return { key, polygons: [] };
}

export interface StageWalls {
  /** Keys of NamedPolygons */
  polygonKeys: string[];
}

export function getGlobalBrushRect(brush: BrushMeta): Geom.Polygon {
  return Geom.Polygon.fromRect(brush.baseRect)
    .scaleBy(brush.scale).add(brush.position);
}

export function getScaledBrushRect(brush: BrushMeta): Geom.Polygon {
  return Geom.Polygon.fromRect(brush.baseRect).scaleBy(brush.scale);
}

export interface SelectedPolygons {
  /** Selected from this polygon */
  polygonKey: string;
  polygons: Geom.Polygon[];
}

export function getBrushSelection(
  brush: BrushMeta,
  { polygonKeys }: StageWalls,
  polygon: StageMeta['polygon'],
) {
  const poly = getGlobalBrushRect(brush)
  const rect = poly.rect;
  return polygonKeys.map(x => polygon[x])
    .map<NamedPolygons>(x => ({ ...x,
      polygons: x.polygons.filter(x => x.rect.intersects(rect)),
    })).filter(x => x.polygons.length)
    .map<SelectedPolygons>((x) => ({
      polygonKey: x.key,
      polygons: geomService.union(x.polygons.flatMap(x => geomService.intersect([poly, x]))),
    }));
}
