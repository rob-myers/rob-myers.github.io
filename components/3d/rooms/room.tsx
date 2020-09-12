import React, { useRef, useEffect, useMemo, useState } from "react";
import { MouseEvent as ThreeMouseEvent } from 'react-three-fiber';
import shortid from "shortid";
import { Coord3, epsilon } from "@model/three/three.model";
import { NavmeshClick } from "@model/shell/events.model";
import { TransformProps, propsToAngle } from "@model/env/env.model";
import useEnvStore, { EnvRoom, State as EnvState } from "@store/env.store";
import useGeomStore, { State as GeomState, RoomMeta } from "@store/geom.store";
import { ExtraInnerProps } from "./inner";


const Room: React.FC<Props> = (props) => {
  const root = useRef<THREE.Group>(null);
  const onClick = useRef<(e: ThreeMouseEvent) => void>();
  const [envName, setEnvName] = useState(null as null | string);
  const initial = useRef({} as InitializedState);
  
  useEffect(() => {
    initial.current = {
      envApi: useEnvStore.getState().api,
      geomApi: useGeomStore.getState().api,
      // Don't expect `props.id` to change (e.g. 'fourway')
      roomKey: `${props.id}.${shortid.generate()}`,
      meta: useGeomStore.getState().rooms[props.id], // Assume correct
    };
    // Connect to env state
    setEnvName(root.current?.parent?.userData.envName??null);
  }, []);
  
  // Can change angle and position
  const angle = propsToAngle(props);
  useEffect(() => void (root.current!.rotation.z = angle), [angle]);
  const { x = 0, y = 0 } = props;
  const position = useMemo(() => [x, y, 0] as Coord3, [x, y]);

  // Representation of Env and Room in store
  const { roomKey, envApi, geomApi, meta } = initial.current;
  const env = useEnvStore(({ env }) => envName ? env[envName] : null);
  const envRoom = useEnvStore<EnvRoom | null>(({ room }) => room[roomKey] || null);

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
      envApi.registerRoom(env.key, roomKey);
      return () => void envApi.unregisterRoom(roomKey);
    }
  }, [env?.key]);

  useEffect(() => {
    if (env) {
      const clone = (env.highWalls ? meta.highMesh : meta.mesh).clone();
      root.current?.add(clone);
      return () => void root.current?.remove(clone);
    }
  }, [env?.highWalls]);

  useEffect(() => {
    if (envRoom?.innerKeys) {
      console.log('received innerKeys', envRoom.innerKeys);
      /**
       * TODO recompute navmesh
       */
    }
  }, [envRoom?.innerKeys]);

  const children = useMemo(() => env?.key && envRoom &&
    React.Children.map(props.children, child => 
      React.isValidElement(child)
        ? React.cloneElement(child, {
            __envKey: env.key,
            __roomKey: roomKey,
          } as ExtraInnerProps)
        : child)
  , [props.children, envRoom]);

  return (
    <group
      ref={root}
      position={position}
      onClick={onClick.current}
    >
      {children}
    </group>
  )
};

interface InitializedState {
  geomApi: GeomState['api'];
  meta: RoomMeta;
  envApi: EnvState['api'];
  roomKey: string;
}

type Props = TransformProps & {
  id: string;
}

export default Room;
