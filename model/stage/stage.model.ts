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
    /** Can we move/zoom the pan-zoom camera? */
    camEnabled: boolean;
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
  /** Used to select rectangles and move templates */
  brush: BrushMeta;
  /** Polygon storage */
  polygon: KeyedLookup<NamedPolygons>;
  /** Has keys of polygons representing high walls */
  walls: StageWalls;
  /** World bounds */
  bounds: Geom.Rect; 
};

export enum CorePolygonKey {
  default = 'default',
  navigable = 'navigable',
}

export function createStage(stageKey: string): StageMeta {
  return {
    key: stageKey,
    internal: {
      camEnabled: true,
      keyEvents: new Subject,
      prevPolygon: {},
      initCamPos: initCameraPos.clone(),
      // ... other stuff attached by components
    },

    brush: createDefaultBrushMeta(),
    polygon: {
      [CorePolygonKey.default]: createNamedPolygons(CorePolygonKey.default),
      [CorePolygonKey.navigable]: createNamedPolygons(CorePolygonKey.navigable),
    },
    walls: createStageWalls({
      polygonKeys: [CorePolygonKey.default],
    }),
    
    bounds: new Geom.Rect(-1, -1, 2, 2),
  };
}

export interface PersistedStage {
  key: string;
  polygon: KeyedLookup<NamedPolygonsJson>;
  cameraPosition: [number, number, number];
  /**
   * TODO
   */
}

export function createPersist(stageKey: string): PersistedStage {
  return {
    key: stageKey,
    polygon: {
      [CorePolygonKey.default]: { key: CorePolygonKey.default, polygons: [] },
      [CorePolygonKey.navigable]: { key: CorePolygonKey.navigable, polygons: [] },
    },
    cameraPosition: [...initCameraPosArray],
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

export function createStageWalls(opts: Partial<StageWalls>): StageWalls {
  return {
    color: '#000',
    opacity: 1,
    height: 10,
    polygonKeys: [],
    ...opts,
  };
}

export interface StageWalls {
  /** Keys of NamedPolygons */
  polygonKeys: string[];
  height: number;
  color: string;
  /** Transparency in range [0,1] */
  opacity: number;
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
