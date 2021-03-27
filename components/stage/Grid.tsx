import { useRef, useMemo } from 'react';
import * as THREE from 'three';

const Grid: React.FC = () => {
  const gridMesh = useRef<JSX.IntrinsicElements['mesh']>(null);
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
        uColor: { value: new THREE.Color('#444') },
        uDistance: { value: 50 },
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
    <mesh
      ref={gridMesh}
      name="grid"
      position={[0, 0, 0]}
      scale={[1, 1, 1]}
      rotation={[Math.PI/2, 0, 0]}
      frustumCulled={false}
    >
      <planeBufferGeometry args={[2, 2, 1, 1]} attach="geometry" />
      {gridMaterial}
    </mesh>
  );
};

export default Grid;