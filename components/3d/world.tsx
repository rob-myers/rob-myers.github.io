import { PerspectiveCamera, PCFSoftShadowMap } from 'three';
import { useRef, useEffect } from 'react';
import { Canvas, CanvasContext } from 'react-three-fiber';
import { debounceTime, tap } from 'rxjs/operators';
import { getWindow } from '@model/dom.model';
import { handleWorldDeviceWrites } from '@model/shell/events.model';
import useGeomStore from '@store/geom.store';
import useEnvStore from '@store/env.store';
import CameraControls from './controls/camera-controls';
import Grid from './grid';
import Inner from './rooms/inner';
import Rooms from './rooms/rooms';
import { Closet, Corner, Fourway, Junction, Straight } from './rooms';
import css from './world.scss';

const World: React.FC<Props> = ({ envName }) => {
  const pixelRatio = useRef(getWindow()?.devicePixelRatio);
  const ctxt = useRef(null as null | CanvasContext);
  const loadedGltf = useGeomStore(({ loadedGltf }) => loadedGltf);
  const env = useEnvStore(({ env }) => env[envName]);

  useEffect(() => {
    if (env) {
      // Update shadows whenever a room changes
      const shadowsSub = env.roomUpdated$.pipe(debounceTime(30), tap(_ => {
        const gl = ctxt.current?.gl;
        gl && (gl.shadowMap.needsUpdate = true);
        gl && setTimeout(() => gl.shadowMap.needsUpdate = false);
      })).subscribe();

      // Listen for messages from shell builtins
      const writeHandler = handleWorldDeviceWrites(envName);
      const stopListening = env.worldDevice.iNode.onWrite((msg) => writeHandler(msg), false);
      return () => {
        stopListening();
        shadowsSub.unsubscribe();
      };
    }
  }, [env]);

  return (
    <div className={css.root} >
      {loadedGltf &&
        <Canvas
          pixelRatio={pixelRatio.current}
          onCreated={(ct) => {
            const camera = ct.camera as PerspectiveCamera;
            camera.position.set(0, 0, 10);
            camera.setFocalLength(30);
            
            ct.gl.shadowMap.enabled = true;
            ct.gl.shadowMap.autoUpdate = false;
            ct.gl.shadowMap.type = PCFSoftShadowMap;
            ctxt.current = ct;
          }}
        >

          <CameraControls />

          <ambientLight
            color="white"
            intensity={1}
          />
          <pointLight
            position={[0, -4, 8]}
            intensity={0.4}
            castShadow
          />
          
          <Grid />

          <Rooms envName={envName}>
            <Closet x={-4}>
              <Inner id="sideboard" />  
            </Closet>
            <Junction>
              <Inner
                id="central-table" y={0} />  
            </Junction>
            <Closet x={4} w>
              <Inner id="sideboard" />  
            </Closet>
            
            <Fourway y={-4} />
            <Corner x={-4} y={-4} n />
            <Straight x={4} y={-4} />
            
            <Straight y={-8} s />
          </Rooms>
        </Canvas>
      }
    </div>
  );
};

interface Props {
  envName: string;
}

export default World;
