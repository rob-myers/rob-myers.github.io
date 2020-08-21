import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { Canvas, extend, useThree, useFrame } from 'react-three-fiber';
import { PanZoomControls } from '@model/three/controls';
import { Box } from './cubes';
import css from './three.scss';

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
        uSize1: { value: 10 },
        uSize2: { value: 100 },
        uColor: { value: new THREE.Color('black') },
        uDistance: { value: 8000 },
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
      <Box position={[0, 0, 1]} />
    </group>
  );
};

const PanZoomRoot: React.FC = () => {
  return (
    <div
      className={css.root}
      style={{ height: 400 }}
    >
      <Canvas pixelRatio={window.devicePixelRatio}>
        <CameraControls />
        <ambientLight />
        <PanZoom />
      </Canvas>
    </div>
  );
};

export default PanZoomRoot;
