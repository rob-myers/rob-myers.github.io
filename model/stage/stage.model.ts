import { Subject } from "rxjs";
import * as THREE from "three";
import { KeyedLookup, Triple } from "model/generic.model";
import * as Geom from "model/geom";
import { PanZoomControls } from "model/3d/pan-zoom-controls";
import { geomService } from "model/geom.service";
import useGeomStore from "store/geom.store";

export type StageMeta = {
  key: string;
  /** Used to draw rects and copy/cut/paste templates */
  brush: BrushMeta;
  /** The internals of the stage */
  internal: StageInternal;
  /** Key value store for internal use */
  extra: StageExtra;
  /** Important options, also for the CLI */
  opts: StageOpts;
  /** Instantiated mesh storage */
  mesh: KeyedLookup<MeshInstance>;
  /** Polygon storage */
  polygon: KeyedLookup<NamedPolygons>;
  /** Defines keys of polygons representing walls */
  walls: StageWalls;
};

export interface StageInternal {
  /** Keyboard events sent by `Stage`  */
  keyEvents: Subject<StageKeyEvent>;
  /** Previous state of all polygons on stage before an edit */
  prevPolygon: KeyedLookup<NamedPolygons>;
  /** Attached on mount */
  controls?: PanZoomControls;
  /** Attached by Stage */
  scene?: THREE.Scene;
  /** Auto-computed world bounds */
  bounds: Geom.Rect;
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
      bounds: initStageBounds.clone(),
      // ... other stuff attached by components
    },
    extra: {},
    opts: createStageOpts(),

    brush: createDefaultBrushMeta(),
    mesh: {},
    polygon: createPolygonLookup(),
    walls: {
      polygonKeys: [CorePolygonKey.default],
    },
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
    wallHeight: 4,
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

export const initCameraPos = new THREE.Vector3(...initCameraPosArray);

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
  rectPolygonKey: string;
  /** Is the selection locked? */
  locked: boolean;
  /** Currently selected polygons */
  selectedPolys: SelectedPolygons[];
  /** Currently selected meshes */
  selectedMeshes: THREE.Mesh[];
  /** Brush position where most recent selection was started */
  selectFrom: THREE.Vector3;
  /** Drag position minus `selectFrom` */
  dragDelta: THREE.Vector3;
}

export function createDefaultBrushMeta(): BrushMeta {
  return {
    baseRect: new Geom.Rect(0, -1, 1, 1),
    position: new Geom.Vector,
    scale: new Geom.Vector(0, 0),
    rectPolygonKey: 'default',
    locked: false,
    selectedPolys: [],
    selectedMeshes: [],
    selectFrom: new THREE.Vector3,
    dragDelta: new THREE.Vector3,
  };
};

export function createMeshInstance(mesh: THREE.Mesh, { x, y }: Geom.VectorJson): MeshInstance {
  const clone = mesh.clone(true) as THREE.Mesh;
  clone.position.set(x, y, 0);
  return {
    key: clone.uuid,
    mesh: clone,
    rect: geomService.rectFromMesh(clone),
  };
}

export interface MeshInstance {
  /** Instance identifier */
  key: string;
  mesh: THREE.Mesh;
  rect: Geom.Rect;
}

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
    .scaleBy(brush.scale)
    .add(brush.position);
}

export function getScaledBrushRect(baseRect: Geom.Rect, scale: Geom.Vector): Geom.Polygon {
  const polygon = Geom.Polygon.fromRect(baseRect).scaleBy(scale);
  const sign = Math.sign(scale.x) * Math.sign(scale.y);
  return sign === -1 ? polygon.reverse() : polygon;
}

export interface SelectedPolygons {
  /** Selected from this polygon */
  polygonKey: string;
  polygons: Geom.Polygon[];
}

export function computeSelectedPolygons(
  brush: BrushMeta,
  { polygonKeys }: StageWalls,
  polygon: StageMeta['polygon'],
): SelectedPolygons[] {
  const brushPoly = getGlobalBrushRect(brush);
  const brushRect = brushPoly.rect;
  return polygonKeys.map(x => polygon[x])
    .map<NamedPolygons>(x => ({ ...x,
      polygons: x.polygons.filter(x => x.rect.intersects(brushRect)),
    })).filter(x => x.polygons.length)
    .map<SelectedPolygons>((x) => ({
      polygonKey: x.key,
      polygons: geomService.union(
        x.polygons.flatMap(x => geomService.intersect([brushPoly, x]))
      ),
    })).filter(x => x.polygons.length);
}

export function computeSelectedMeshes(
  brush: BrushMeta,
  mesh: StageMeta['mesh'],
): THREE.Mesh[] {
  const brushRect = getGlobalBrushRect(brush).rect;
  const touchedMeshes = Object.values(mesh).filter(({ mesh }) => {
    const meshRect = geomService.rectFromMesh(mesh);
    return brushRect.containsRect(meshRect);
  });
  return touchedMeshes.map(({ mesh }) => {
    const clone = mesh.clone(true) as THREE.Mesh;
    clone.castShadow = false;
    clone.material = useGeomStore.api.getMeshDef(mesh.name).selectedMaterial;
    return clone;
  });
}