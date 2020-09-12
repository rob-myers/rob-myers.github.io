import { useRef, useEffect, useMemo, useState } from "react";
import { MouseEvent as ThreeMouseEvent } from 'react-three-fiber';
import shortid from "shortid";
import { Coord3, epsilon } from "@model/three/three.model";
import { NavmeshClick } from "@model/shell/events.model";
import useEnvStore from "@store/env.store";
import useGeomStore from "@store/geom.store";
import { alwaysEqual } from "@store/store.util";

const Room: React.FC<Props> = (props) => {

  const root = useRef<THREE.Group>(null);
  const { api: geomApi, meta } = useGeomStore(({ api, rooms }) =>
    ({ api, meta: rooms[props.id] }), alwaysEqual);
  const { api: envApi } = useEnvStore(({ api }) => ({ api }));
  
  // Don't expect `props.id` to change (e.g. 'fourway')
  const instanceKey = useRef(`${props.id}.${shortid.generate()}`);
  const onClick = useRef<(e: ThreeMouseEvent) => void>();
  const [userData, setUserData] = useState({} as Record<string, string | null>);
  
  const angle = propsToAngle(props);
  useEffect(() => void (root.current!.rotation.z = angle), [angle]);
  const { x = 0, y = 0 } = props;
  const position = useMemo(() => [x, y, 0] as Coord3, [x, y]);

  const [envName, setEnvName] = useState(null as null | string);
  const env = useEnvStore(({ env }) => envName ? env[envName] : null);
  useEffect(() => {// Connect to env state
    setEnvName(root.current?.parent?.userData.envName??null);
  }, []);

  useEffect(() => {
    if (env) {// Connected to env state
      onClick.current = (e: ThreeMouseEvent) => {
        e.stopPropagation();
        if (Math.abs(e.point.z) < epsilon) {// Only floor clicks
          console.log({ clickedRoom: e });
          const position = geomApi.geom.project(e.point);
          const event: NavmeshClick = { key: 'navmesh-click', position };
          env?.worldDevice.write(event);
        }
      };
      envApi.registerRoom(env.key, instanceKey.current);
      // Provide user data to children
      setUserData({ type: 'roomGroup', instanceKey: instanceKey.current });

      return () => {
        envApi.unregisterRoom(env.key, instanceKey.current);
      };
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
      onClick={onClick.current}
      userData={userData}
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

type Props = TransformProps & {
  id: string;
}

export type TransformProps = {
  x?: number;
  y?: number;
} & (
  | { e?: boolean }
  | { s?: boolean }
  | { w?: boolean }
  | { n?: boolean }
)

export default Room;
