import React, { useRef, useEffect, useState } from "react";
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
  const children = useRef(undefined as any);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const envName = root.current!.parent!.userData.envName as string;
    const env = useEnvStore.getState().env[envName];
    const meta =  useGeomStore.getState().rooms[props.id];
    if (!env || !meta) {
      return console.error(`Room must be inside World with valid id "${props.id}"`);
    }
    
    // Add room mesh i.e. walls
    mesh.current = (env.highWalls ? meta.highMesh : meta.mesh).clone();
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
        const position = geomApi.geom.project(e.point);
        const event: NavmeshClick = { key: 'navmesh-click', position };
        env.worldDevice.write(event);
      }
    };

    // Can now mount children i.e. Inners
    setMounted(true);
  }, []);
  
  // Can change angle/position
  useEffect(() => {
    root.current!.rotation.z = propsToAngle(props);
    root.current!.position.set(props.x || 0, props.y || 0, 0);
    children.current = React.Children.map(props.children, child => 
      React.isValidElement(child)
        ? React.cloneElement(child, {
            innerUpdated: () => channel.current.next({ key: 'inner-updated' }),
          })
        : child);
  }, [props]);

  return (
    <group
      ref={root}
      onClick={onClick.current}
    >
      {mounted && children.current}
    </group>
  );
};

type Props = TransformProps & {
  id: string;
}

export default Room;
