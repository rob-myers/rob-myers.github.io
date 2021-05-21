import { Triple } from 'model/generic.model';
import { VectorJson } from 'model/geom';
import * as THREE from 'three';

export const identityMatrix4 = new THREE.Matrix4;

export function isGroupNode(x: THREE.Object3D): x is THREE.Group {
  return x.type === 'Group';
}

export function isMeshNode(x: THREE.Object3D): x is THREE.Mesh {
  return x.type === 'Mesh';
}

export function ndCoordsToGround(
  ndCoords: VectorJson,
  camera: THREE.Camera,
  output = new THREE.Vector3,
) {
  output.set(ndCoords.x, ndCoords.y, 0.5);
  output.unproject(camera).sub(camera.position).normalize();
  output.multiplyScalar((0 - camera.position.z) / output.z);
  output.add(camera.position);
  return output;
}

export function vectPrecision(v: THREE.Vector3, decimalPlaces: number) {
  return v.set(
    Number(v.x.toFixed(decimalPlaces)),
    Number(v.y.toFixed(decimalPlaces)),
    Number(v.z.toFixed(decimalPlaces)),
  );
}

/** Increments of 0.05, e.g. 3.15 */
export function vectPrecisionSpecial(v: THREE.Vector3) {
  return v.set(
    Number((Math.round(v.x / 0.05) * 0.05).toFixed(2)),
    Number((Math.round(v.y / 0.05) * 0.05).toFixed(2)),
    Number((Math.round(v.z / 0.05) * 0.05).toFixed(2)),
  );
}

export function vectorToTriple({ x, y, z }: { x: number; y: number; z: number }): Triple<number> {
  return [x, y, z];
}

export function matrixToPosition(matrix: THREE.Matrix4, position: THREE.Vector3) {
  return position.set(
    matrix.elements[12],
    matrix.elements[13],
    0,
  );
}

export function loadJson<T extends THREE.Object3D>(rootJson: ThreeJson) {
  return new Promise<T>(resolve => {
    (new THREE.ObjectLoader).parse(rootJson, (x) => resolve(x as T));
  });
}

export function createPlaceholderGroup() {
  const group = new THREE.Group;
  const light = new THREE.DirectionalLight();
  light.position.set(-1, 3, 2);
  light.lookAt(0, 0, 0);
  light.name = "TempLight";
  group.add(light);

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshStandardMaterial({ color: new THREE.Color('#0000ff')}),
  );
  mesh.position.setY(0.5);
  mesh.name = "TempCube";
  group.add(mesh);

  group.add(createGrid(), createAxes());
  return group;
}


/** Rough and ready approach without "type" literal refinements */
export interface ThreeJson {
  geometries: ThreeGeometryJson[];
  materials: ThreeMaterialJson[];
  metadata: { version: number; type: string; generator: string; }
  object: ThreeObjectJson;
}

interface ThreeObjectJson {
  children: ThreeObjectJson[];
  matrix: number[];
  name: string;
  type: string;
  uuid: string;
}

interface ThreeGeometryJson {
  depth: number;
  depthSegments: number;
  height: number;
  heightSegments: number;
  type: string;
  uuid: string;
  width: number;
  widthSegments: number;
}

interface ThreeMaterialJson {
  color: number;
  colorWrite: boolean;
  depthFunc: number;
  depthTest: boolean;
  depthWrite: boolean;
  emissive: number;
  envMapIntensity: number;
  metalness: number;
  refractionRatio: number;
  roughness: number;
  stencilFail: number;
  stencilFunc: number;
  stencilFuncMask: number;
  stencilRef: number;
  stencilWrite: boolean;
  stencilWriteMask: number;
  stencilZFail: number;
  stencilZPass: number;
  type: string;
  uuid: string;
}

function createAxis(type: 'x' | 'y' | 'z', color: string, length: number) {
  const points = [new THREE.Vector3, new THREE.Vector3];
  [points[0][type], points[1][type]] = [-length/2, length/2];
  const geometry = (new THREE.BufferGeometry).setFromPoints(points);
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, opacity: 1, linewidth: 1 }));
  line.name = `${type}Axis`;
  return line;
}

function createAxes() {
  const xAxis = createAxis('x', '#500', 1000);
  const zAxis = createAxis('z', '#005', 1000);
  const group = (new THREE.Group).add(xAxis, zAxis);
  group.name = "Axes";
  return group;
}

function createGrid(input = {} as any) {
  const {
    color, size1, size2, distance, axes,
  } = {
    color: input.color || new THREE.Color("#333"),
    size1: input.size1 || 0.2,
    size2: input.size2 || 1,
    distance: input.distance || 8000,
    axes: input.axes || "xzy",
  };

  const planeAxes = axes.substr( 0, 2 );
  const geometry = new THREE.PlaneBufferGeometry( 2, 2, 1, 1 );

  const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      uSize1: { value: size1 },
      uSize2: { value: size2 },
      uColor: { value: color },
      uDistance: { value: distance }
    },
    transparent: true,

    vertexShader: `
        varying vec3 worldPosition;
        uniform float uDistance;
        
        void main() {
              vec3 pos = position.${axes} * uDistance;
              pos.${planeAxes} += cameraPosition.${planeAxes};
              worldPosition = pos;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,

    fragmentShader: `
        varying vec3 worldPosition;
        
        uniform float uSize1;
        uniform float uSize2;
        uniform vec3 uColor;
        uniform float uDistance;
          
        float getGrid(float size) {
          vec2 r = worldPosition.${planeAxes} / size;
          vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
          float line = min(grid.x, grid.y);
          return 1.0 - min(line, 1.0);
        }
          
        void main() {
          // float d = 1.0 - min(distance(cameraPosition.${planeAxes}, worldPosition.${planeAxes}) / uDistance, 1.0);
          float d = 1.0 - 0.25;
          float g1 = getGrid(uSize1);
          float g2 = getGrid(uSize2);
          gl_FragColor = vec4(uColor.rgb, mix(g2, g1, g1) * pow(d, 3.0));
          gl_FragColor.a = mix(0.5 * gl_FragColor.a, gl_FragColor.a, g2);
          if ( gl_FragColor.a <= 0.0 ) discard;
        }
    `,

    extensions: {
      derivatives: true
    }

  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;

  return mesh;
}