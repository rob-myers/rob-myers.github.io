import { useRef, useEffect, useCallback, useMemo, useState } from "react";
import { MouseEvent as ThreeMouseEvent } from 'react-three-fiber';
import { Coord3, epsilon } from "@model/three/three.model";
import { NavmeshClick } from "@model/shell/events.model";
import useEnvStore from "@store/env.store";
import useGeomStore from "@store/geom.store";
import { alwaysEqual } from "@store/store.util";

const Room: React.FC<Props> = (props) => {

  const root = useRef<THREE.Group>(null);
  const { api, meta } = useGeomStore(({ api, rooms }) =>
    ({ api, meta: rooms[props.is] }), alwaysEqual);
  
  const angle = propsToAngle(props);
  useEffect(() => void (root.current!.rotation.z = angle), [angle]);
  const { x = 0, y = 0 } = props;
  const position = useMemo(() => [x, y, 0] as Coord3, [x, y]);

  const [envName, setEnvName] = useState(null as null | string);
  const env = useEnvStore(({ env }) => envName ? env[envName] : null);
  useEffect(() => {// We'll connect to environment state using envName
    setEnvName(root.current?.parent?.userData.envName??null);
  }, []);

  const onClick = useCallback((e: ThreeMouseEvent) => {
    e.stopPropagation();
    if (Math.abs(e.point.z) < epsilon) {// Only floor clicks
      console.log({ clickedRoom: e });
      const position = api.geom.project(e.point);
      const event: NavmeshClick = { key: 'navmesh-click', position };
      env?.worldDevice.write(event);
    }
  }, [env?.key]);

  useEffect(() => {
    if (env) {
      const clone = (env.highWalls ? meta.highMesh : meta.mesh).clone();
      root.current?.add(clone);
      return () => void root.current?.remove(clone);
    }
  }, [env?.highWalls]);

  return (
    <group
      ref={root}
      position={position}
      onClick={onClick}
    >
      {props.children}
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
