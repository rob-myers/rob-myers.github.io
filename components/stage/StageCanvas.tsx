/**
 * Based on https://github.com/pmndrs/react-three-fiber/blob/master/packages/fiber/src/web/Canvas.tsx
 */
import { useEffect, useLayoutEffect, useRef } from "react"
import useMeasure from 'react-use-measure';
import * as THREE from "three";
import { getWindow } from "model/dom.model";

export default function StageCanvas(props: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const ctxt = useRef<StageCtxt>({ camera: props.camera } as StageCtxt);

  useEffect(() => {
    const { camera, subscribers } = props;
    Object.assign(ctxt.current, { camera, subscribers } as StageCtxt);
  }, [props.subscribers, props.camera]);

  useEffect(() => {
    const scene = new THREE.Scene;
    scene.add(props.group); // TEMP

    const gl = new THREE.WebGLRenderer({
      canvas: canvas.current!,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    gl.setSize(canvas.current!.width, canvas.current!.height);
    gl.setPixelRatio(getWindow()!.devicePixelRatio);

    Object.assign(ctxt.current, { scene, camera: props.camera, gl });
    props.onCreated(ctxt.current);

    const clock = new THREE.Clock;
    let animId = 0, delta = 0;

    function animate() {
      delta = clock.getDelta();
      ctxt.current.subscribers.forEach(fn => fn(ctxt.current, delta))
      gl.render(scene, ctxt.current.camera);
      animId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animId);
      gl.renderLists.dispose();
      gl.forceContextLoss(); // Not logged when gl.dispose()?
      gl.dispose();
    };
  }, []);

  /**
   * Resize camera on change canvas size, as in
   * react-three-fiber packages/fiber/src/core/store.ts.
   * Also useLayoutEffect because gl.setSize().
   */
  const [ref, size] = useMeasure({
    scroll: true,
    debounce: { scroll: 50, resize: 0 },
  });
  useLayoutEffect(() => {
    if (size.width && size.height) {
      ctxt.current.gl.setSize(size.width, size.height);
    }

    const { camera } = ctxt.current;
    if (camera.type === 'OrthographicCamera') {
      camera.left = size.width / -2;
      camera.right = size.width / 2;
      camera.top = size.height / 2;
      camera.bottom = size.height / -2;
    } else {
      camera.aspect = size.width / size.height;
    }
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }, [size]);

  return (
    <div
      ref={ref}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
    >
      <canvas ref={canvas} style={{ display: 'block' }} />
    </div>
  );
}

interface Props {
  onCreated: (ctxt: StageCtxt) => void;
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  group: THREE.Group; // TEMP
  subscribers: Subscriber[];
}

export interface StageCtxt {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  gl: THREE.WebGLRenderer;
  subscribers: Subscriber[];
}

type Subscriber = (ctxt: StageCtxt, delta: number) => void;
