import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { useRef, useMemo, Suspense } from 'react';
import { Canvas, extend, useThree, useFrame } from 'react-three-fiber';
import { PanZoomControls } from '@model/three/controls';
import { Wall, Table } from './geom';
import css from './three.scss';

const First = dynamic(() => import('@components/demo/three/first.gltf'), { ssr: false });

// See types/react-three-fiber/three-types.d.ts
extend({ PanZoomControls });

type Coord = [number, number, number];
const _zero: Coord = [0, 0, 0];
const _one: Coord = [1, 1, 1];
type El = JSX.IntrinsicElements;

const CameraControls: React.FC = () => {
  const { camera, gl: { domElement } } = useThree();
  const controls = useRef<PanZoomControls>();
  useFrame((_state) => controls.current!.update());
  return <panZoomControls ref={controls} args={[camera, domElement]} />;
};

const PanZoom: React.FC = () => {
  const gridMesh = useRef<El['mesh']>(null);
  /**
   * https://github.com/Fyrestar/THREE.InfiniteGridHelper/blob/master/InfiniteGridHelper.js
   */
  const gridMaterial = useMemo(() => (
    <shaderMaterial
      attach="material"
      side={THREE.DoubleSide}
      uniforms={{
        uSize1: { value: 0.1 },
        uSize2: { value: 1 },
        uColor: { value: new THREE.Color('#777') },
        uDistance: { value: 1024 },
      }}
      transparent
      vertexShader={`
        varying vec3 worldPosition;
        uniform float uDistance;
        
        void main() {
            vec3 pos = position.xzy * uDistance;
            pos.xz += cameraPosition.xz;
            worldPosition = pos;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }

      `}
      fragmentShader={`
        varying vec3 worldPosition;
            
        uniform float uSize1;
        uniform float uSize2;
        uniform vec3 uColor;
        uniform float uDistance;
        
        float getGrid(float size) {
          vec2 r = worldPosition.xz / size;
          vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
          float line = min(grid.x, grid.y);
          return 1.0 - min(line, 1.0);
        }
        
        void main() {
          float d = 1.0 - min(distance(cameraPosition.xz, worldPosition.xz) / uDistance, 1.0);
          float g1 = getGrid(uSize1);
          float g2 = getGrid(uSize2);
          
          gl_FragColor = vec4(uColor.rgb, mix(g2, g1, g1) * pow(d, 3.0));
          gl_FragColor.a = mix(0.5 * gl_FragColor.a, gl_FragColor.a, g2);
          if ( gl_FragColor.a <= 0.0 ) discard;
        }
      `}
      extensions={{
        derivatives: true,
      } as any}
    />
  ), []);

  return (
    <group>
      <mesh
        ref={gridMesh}
        position={[0, 0, 0]}
        scale={[1, 1, 1]}
        rotation={[Math.PI/2, 0, 0]}
        frustumCulled={false}
      >
        <planeBufferGeometry args={[2, 2, 1, 1]} attach="geometry" />
        {gridMaterial}
      </mesh>
      <Wall p={[-2, 1]} d={[4, 0.1]} />
      <Wall p={[3, 1]} d={[0.1, 2]} />
      <Wall p={[-2, 0]} d={[0.1, 1]} />
      
      <Wall p={[-2, 1]} d={[0.1, 0.5]} />
      <Wall p={[-1, 1]} d={[0.1, 0.5]} />
      <Wall p={[0, 1]} d={[0.1, 0.5]} />

      <Table p={[-1, -1]} d={[0.5, 1]} />
      <Table p={[0, -1]} d={[0.5, 1]} />
      <Table p={[1, -1]} d={[0.5, 1]} />      

      <group rotation={[Math.PI/2, 0, 0]}>
        <Suspense fallback={null}>
          <First />
        </Suspense>
      </group>
    </group>
  );
};

const PanZoomRoot: React.FC = () => {
  return (
    <div
      className={css.root}
      style={{ height: 400 }}
    >
      <Canvas
        pixelRatio={window.devicePixelRatio}
        onCreated={(ctxt) => {
          ctxt.camera.position.set(0, 0, 2);
        }}
      >
        <CameraControls />
        <ambientLight color="white" intensity={0.5} />
        <pointLight position={[0, 0, 5]} intensity={1} />
        <PanZoom />
      </Canvas>
    </div>
  );
};

export default PanZoomRoot;
