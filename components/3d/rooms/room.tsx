import { useRef, useEffect, useCallback, useMemo, useState } from "react";
import { MouseEvent as ThreeMouseEvent } from 'react-three-fiber';
import useEnvStore from "@store/env.store";
import useGeomStore from "@store/geom.store";
import { Coord3 } from "@model/three/three.model";
import { NavmeshClick } from "@model/shell/events.model";

const undoGltfRotation = [Math.PI/2, 0, 0] as Coord3;

const Room: React.FC<Props> = (props) => {
  const root = useRef<THREE.Group>(null);
  const walls = useRef<THREE.Group>(null);
  
  const [envName, setEnvName] = useState(null as null | string);
  const env = useEnvStore(({ env }) => envName ? env[envName] : null);
  
  const position = useMemo(() => [props.x || 0, props.y || 0, 0] as Coord3, [props.x, props.y]);
  const meta = useGeomStore(({ rooms }) => rooms[props.is]);
  const api = useGeomStore(({ api }) => api);
  const wallsScale = useMemo(() => [1, env?.highWalls ? 3 : 1, 1] as Coord3, [env]);
  
  const onClick = useCallback((e: ThreeMouseEvent) => {
    e.stopPropagation();
    if (Math.abs(e.point.z) < 0.0001) {// Only floor clicks
      console.log({ clickedRoom: e });
      const position = api.geom.project(e.point);
      const event: NavmeshClick = { key: 'navmesh-click', position };
      env?.worldDevice.write(event);
    }
  }, [env]);

  useEffect(() => {
    if (meta) {
      // Attach walls
      const clone = meta.mesh.clone();
      walls.current?.add(clone);
      // We'll connect to environment using envName
      setEnvName(root.current?.parent?.userData.envName??null);
      return () => void walls.current?.remove(clone);
    }
  }, [meta]);

  const angle = propsToAngle(props);
  useEffect(() => void (root.current!.rotation.y = angle), [angle]);

  return (
    <group
      ref={root}
      position={position}
      rotation={undoGltfRotation}
      onClick={onClick}
    >
      <group
        ref={walls}
        scale={wallsScale}
      />
    </group>
  )
};

function propsToAngle(props: Props) {
  return 'e' in props ? 0
    : 's' in props ? -Math.PI/2
    : 'w' in props ? Math.PI
    : 'n' in props ? Math.PI/2 : 0;
}

type Props = RoomTransformProps & {
  is: string;
}

export type RoomTransformProps = {
  x?: number;
  y?: number;
} & (
  | { e?: boolean }
  | { s?: boolean }
  | { w?: boolean }
  | { n?: boolean }
)

export default Room;
