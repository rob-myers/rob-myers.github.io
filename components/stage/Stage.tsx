import { useCallback, useEffect, useRef, useState } from "react";
import { PerspectiveCamera } from "three";
import { Canvas, CanvasContext } from "react-three-fiber";
import { Subject } from "rxjs";

import { getWindow, getNormDevicePos } from "model/dom.model";
import { initCameraPos, StoredStage } from "model/stage.model";
import useGeomStore from "store/geom.store";
import useStageStore from "store/stage.store";

import StageToolbar from "./StageToolbar";
import CameraControls from "./CameraControls";
import Grid from "./Grid";
import Lights from "./Lights";
import Brush, { PointerMsg } from "./Brush";
import Walls from "./Walls";
import styles from 'styles/Stage.module.css';

const Stage: React.FC<Props> = ({ stageKey }) => {
  const stage = useStageStore<StoredStage | null>(({ stage }) => stage[stageKey]??null);
  const loadedGltf = useGeomStore(({ loadedGltf }) => loadedGltf);
  const pixelRatio = useRef(getWindow()?.devicePixelRatio);
  const [ctxt, setCtxt] = useState(null as null | CanvasContext);

  useEffect(() => {
    useStageStore.api.createStage(stageKey);
    return () => useStageStore.api.removeStage(stageKey);
  }, [stageKey]);

  useEffect(() => {
    stage && ctxt?.gl && useStageStore.api.updateStage(stageKey, { scene: ctxt.scene });
  }, [stage?.key, ctxt?.gl]);

  const onCreatedCanvas = useCallback((ctxt: CanvasContext) => {
    initializeCanvasContext(ctxt);
    setCtxt(ctxt);
  }, []);

  const ptrWire = useRef(new Subject<PointerMsg>()).current;
  const onPointer = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    ptrWire.next({ key: e.type as any, ndCoords: getNormDevicePos(e) });
  }, [stage]);
  
  const keyWire = stage?.keyEvents;
  const onKey = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    keyWire?.next({ key: e.type as any, keyName: e.key });
  }, [keyWire]);

  return (
    <section
      className={styles.root}
      tabIndex={0}
      onKeyDown={onKey}
      onKeyUp={onKey}
    >
      <StageToolbar stage={stage} />

      {stage && loadedGltf && (
        <Canvas
          pixelRatio={pixelRatio.current}
          onCreated={onCreatedCanvas}
          onPointerDown={onPointer}
          onPointerMove={onPointer}
          onPointerUp={onPointer}
          onPointerLeave={onPointer}
        >
          <CameraControls
            stageKey={stageKey}
            enabled={stage.camEnabled}
          />
          <Grid />
          <Lights />
          {stage.controls && (
            <Brush
              stage={stage}
              wire={ptrWire}
            />
          )}
          <Walls wallPolys={stage.wallPolys} />
        </Canvas>
      )}
    </section>
  );
}

interface Props {
  stageKey: string;
}

function initializeCanvasContext(ctxt: CanvasContext) {
  const camera = ctxt.camera as PerspectiveCamera;
  camera.position.copy(initCameraPos);
  camera.setFocalLength(35);
  // ctxt.gl.shadowMap.enabled = true;
  // ctxt.gl.shadowMap.autoUpdate = false;
  // ctxt.gl.shadowMap.type = PCFSoftShadowMap;
}

export default Stage;
