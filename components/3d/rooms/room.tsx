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
  const mesh = useRef(null as null | THREE.Mesh);
  const onClick = useRef<(e: ThreeMouseEvent) => void>();
  const channel = useRef(new Subject<({ key: 'inner-updated' })>());

  const [mountChildren, setChildrenMounted] = useState(false);

  useEffect(() => {
    const envName = props.envName!;
    const env = useEnvStore.getState().env[envName];
    const meta =  useGeomStore.getState().rooms[props.id];
    if (!env || !meta) {
      return console.error(`Room must be inside World with valid id "${props.id}"`);
    }
    
    // Add room mesh i.e. walls
    mesh.current = (env.highWalls ? meta.highMesh : meta.mesh).clone();
    mesh.current.castShadow = true;
    root.current?.add(mesh.current);
    
    // Recompute navmesh whenever an Inner mounts/updates
    const geomApi = useGeomStore.getState().api;
    channel.current
      .pipe(debounceTime(30))
      .subscribe({ next: () => geomApi.updateRoomNavmesh(mesh.current!) });
    channel.current.next({ key: 'inner-updated' }); // Initialise

    // Handle navmesh clicks
    onClick.current = (e: ThreeMouseEvent) => {
      e.stopPropagation();
      if (Math.abs(e.point.z) < epsilon) {// Only floor clicks
        console.log({ clickedRoom: e });
        const position = geomApi.geom.projectXY(e.point);
        const event: NavmeshClick = { key: 'navmesh-click', position };
        env.worldDevice.write(event);
      }
    };

    setChildrenMounted(true); // Now mount Inners
  }, []);
  
  // Can change angle/position
  const angle = propsToAngle(props);
  useEffect(() => {
    root.current!.rotation.z = propsToAngle(props);
    root.current!.position.set(props.x || 0, props.y || 0, 0);
    useEnvStore.getState().api.roomUpdated(props.envName!);
  }, [angle, props.x, props.y]);

  const children = useMemo(() =>
    React.Children.map(props.children, child => 
      React.isValidElement(child)
        ? React.cloneElement(child, {
            innerUpdated: () => channel.current.next({ key: 'inner-updated' }),
          })
        : child)
  , [props.children]);

  return (
    <group
      ref={root}
      onClick={onClick.current}
    >
      {mountChildren && children}
    </group>
  );
};

type Props = TransformProps & {
  id: string;
  /** Internal only */
  envName?: string;
}

export default Room;
