import React, { useRef, useEffect, useState, useMemo } from "react";
import { MouseEvent as ThreeMouseEvent } from 'react-three-fiber';
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";

import { epsilon } from "@model/three/three.model";
import { NavmeshClick } from "@model/shell/events.model";
import { TransformProps, propsToAngle } from "@model/env/env.model";
import useEnvStore from "@store/env.store";
import useGeomStore from "@store/geom.store";

const Room: React.FC<Props> = (props) => {
  const root = useRef<THREE.Group>(null);
  const onClick = useRef<(e: ThreeMouseEvent) => void>();
  const channel = useRef(new Subject<(
    | { key: 'inner-updated' }
  )>());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const envName = root.current!.parent!.userData.envName as string;
    const env = useEnvStore.getState().env[envName];
    const meta =  useGeomStore.getState().rooms[props.id];
    if (!env || !meta) {
      return console.error(`Room must be inside World with valid id "${props.id}"`);
    }
    const geomApi = useGeomStore.getState().api;

    // Add walls
    const clone = (env.highWalls ? meta.highMesh : meta.mesh).clone();
    root.current?.add(clone);

    // Recompute navmesh whenever an Inner mounts/updates
    channel.current
      .pipe(debounceTime(30))
      .subscribe({ next: () => geomApi.updateRoomNavmesh(root.current!) });
    channel.current.next({ key: 'inner-updated' }); // Initialise

    // Handle navmesh clicks
    onClick.current = (e: ThreeMouseEvent) => {
      e.stopPropagation();
      if (Math.abs(e.point.z) < epsilon) {// Only floor clicks
        console.log({ clickedRoom: e });
        const position = geomApi.geom.project(e.point);
        const event: NavmeshClick = { key: 'navmesh-click', position };
        env.worldDevice.write(event);
      }
    };

    // Can now mount children i.e. Inners
    setMounted(true);
  }, []);
  
  // Can change angle and position
  const angle = propsToAngle(props);
  useEffect(() => {
    root.current!.rotation.z = angle;
    root.current!.position.set(props.x || 0, props.y || 0, 0);
  }, [angle, props.x, props.y]);

  const children = useMemo(() =>
    React.Children.map(props.children, child => 
      React.isValidElement(child)
        ? React.cloneElement(child, {
            innerUpdated: () => channel.current.next({ key: 'inner-updated' }),
          })
        : child)
    , [props.children]);

  // TODO high walls handled elsewhere i.e. traverse scene graph
  //
  // const highWalls = useEnvStore(({ env }) => env[initial.current?.envName]?.highWalls);
  // useEffect(() => {
  //   const clone = initial.current!.meta[(highWalls ? 'highMesh' : 'mesh')].clone();
  //   root.current?.add(clone);
  //   return () => void root.current?.remove(clone);
  // }, [highWalls]);

  return (
    <group
      ref={root}
      onClick={onClick.current}
    >
      {mounted && children}
    </group>
  );
};

type Props = TransformProps & {
  id: string;
}

export default Room;
