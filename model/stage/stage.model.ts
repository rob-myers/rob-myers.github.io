import { Subject } from "rxjs";
import { Vector3, Scene } from "three";
import { KeyedLookup, Triple } from "model/generic.model";
import * as Geom from 'model/geom';
import { PanZoomControls } from 'model/3d/pan-zoom-controls';
import { geomService } from "model/geom.service";

export type StageMeta = {
  key: string;
  /** Stuff the CLI usually would not access */
  internal: {
    /** Keyboard events sent by `Stage`  */
    keyEvents: Subject<StageKeyEvent>;
    /** Previous state of all polygons on stage before an edit */
    prevPolygon: KeyedLookup<NamedPolygons>;
    /** Initial position of camera */
    initCamPos: Vector3;
    /** Attached on mount */
    controls?: PanZoomControls;
    /** Attached on mount */
    scene?: Scene;
  };
  opts: StageOpts;
  /** Used to paint rectangles and copy/cut/paste templates */
  brush: BrushMeta;
  /** Polygon storage */
  polygon: KeyedLookup<NamedPolygons>;
  /** Has keys of polygons representing high walls */
  walls: StageWalls;
  /** World bounds */
  bounds: Geom.Rect;
};

export interface StageOpts {
  /** Can we move/zoom the pan-zoom camera? */
  panZoom: boolean;
  lights: boolean;
  /** CSS background of stage */
  background: string;
  wallHeight: number;
  wallColor: string;
  /** Transparency in range [0,1] */
  wallOpacity: number;
  /** Persist on unload window? */
  autoPersist: boolean;
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
      initCamPos: initCameraPos.clone(),
      // ... other stuff attached by components
    },
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
    lights: true,
    panZoom: true,
    background: 'white',
    wallColor: '#000',
    wallOpacity: 1,
    wallHeight: 2,
    autoPersist: true,
  };
}

export interface PersistedStage {
  key: string;
  polygon: KeyedLookup<NamedPolygonsJson>;
  cameraPosition: [number, number, number];
  opts: StageOpts;
}

export function createPersist(stageKey: string): PersistedStage {
  return {
    key: stageKey,
    polygon: createPolygonLookup(),
    cameraPosition: [...initCameraPosArray],
    opts: createStageOpts(),
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
  rect: Geom.Rect;
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
    rect: new Geom.Rect(0, -1, 1, 1), // ?
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
  return Geom.Polygon.fromRect(brush.rect)
    .scaleBy(brush.scale).add(brush.position);
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
