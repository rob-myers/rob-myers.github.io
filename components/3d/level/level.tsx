import React, { useMemo, useRef, useEffect, useCallback } from "react";
import { isMeshNode } from "@model/three/three.model";
import useGeomStore from '@store/geom.store';
import useEnvStore from '@store/env.store';
import { PointerEvent } from "react-three-fiber";

const Level: React.FC<Props> = (props) => {
  const level = useRef<THREE.Group>(null);
  const env = useEnvStore(({ env }) => env[props.envName]);

  useEffect(() => {// Swap between normal/high walls
    const metas = useGeomStore.getState().rooms;
    env && level.current?.traverse((o) => (o.name in metas && isMeshNode(o)) &&
      (o.geometry = metas[o.name][env.highWalls ? 'highMesh' : 'mesh'].geometry));
  }, [env?.highWalls]);

  const children = useMemo(() => 
    React.Children.map(props.children, child => 
      React.isValidElement(child)
        ? React.cloneElement(child, {
          envName: props.envName,
        })
        : child),
    [props.children]);

  const storeMouse = useCallback((e: PointerEvent) => {
    useEnvStore.api.storeMouse(props.envName, e);
    e.stopPropagation();
  }, []);

  return (
    <group
      ref={level}
      name="level"
      onPointerMove={storeMouse}
    >
     {env && children}
    </group>
  );
};

interface Props {
  envName: string;
}

export default Level;