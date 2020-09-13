import { useEffect, useRef } from "react";
import { innerGroupName } from "@model/env/env.model";
import useGeomStore from '@store/geom.store';

const Inner: React.FC<Props> = (props: Props) => {
  const root = useRef<THREE.Group>(null);

  useEffect(() => {
    const inner = useGeomStore.getState().inners[props.id];
    if (!props.innerUpdated || !inner) {
      return console.error('Inner should be mounted inside a Room');
    }
    root.current?.add(inner.mesh.clone());
    props.innerUpdated();
  }, []);

  // Can change position
  useEffect(() => {
    if (props.innerUpdated) {
      root.current!.position.set(props.x || 0, props.y || 0, 0);
      props.innerUpdated();
    }
  }, [props.x, props.y]);

  return (
    <group
      ref={root}
      name={innerGroupName}
    />
  );
};

type Props = {
  id: string;
  x?: number;
  y?: number;
  /** Internal only */
  innerUpdated?: () => void;
}

export default Inner;
