import { PerspectiveCamera, PCFSoftShadowMap } from 'three';
import { useRef, useEffect, useState } from 'react';
import { Canvas, CanvasContext } from 'react-three-fiber';
import { debounceTime, tap } from 'rxjs/operators';
import { getWindow } from '@model/dom.model';
import { handleWorldDeviceWrites } from '@model/env/world.device';
import useGeomStore from '@store/geom.store';
import useEnvStore from '@store/env.store';
import CameraControls from './controls/camera-controls';
import Grid from './grid';
import FirstLevel from './levels/first-level';
import css from './world.scss';

const World: React.FC<Props> = ({ envName }) => {
  const pixelRatio = useRef(getWindow()?.devicePixelRatio);
  const loadedGltf = useGeomStore(({ loadedGltf }) => loadedGltf);
  const [ctxt, setCtxt] = useState(null as null | CanvasContext);
  const env = useEnvStore(({ env }) => env[envName]);

  useEffect(() => {
    if (env && ctxt) {
      // Update shadows whenever a room changes
      const shadowsSub = env.updateShadows$.pipe(debounceTime(30), tap(_ => {
        ctxt.gl.shadowMap.needsUpdate = true;
        setTimeout(() => ctxt.gl.shadowMap.needsUpdate = false);
      })).subscribe();

      // Listen for messages from shell builtins
      const writeHandler = handleWorldDeviceWrites(envName, ctxt.scene);
      const stopListening = env.worldDevice.iNode.onWrite((msg) => writeHandler(msg), false);
      return () => {
        stopListening();
        shadowsSub.unsubscribe();
      };
    }
  }, [env, ctxt]);

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
            setCtxt(ct);
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

          <FirstLevel envName={envName} />

        </Canvas>
      }
    </div>
  );
};

interface Props {
  envName: string;
}

export default World;
