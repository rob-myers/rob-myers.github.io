import { useEffect, useRef, useMemo } from "react";
import shortid from "shortid";
import { TransformProps, propsToAngle } from "@model/env/env.model";
import { Coord3 } from "@model/three/three.model";
import useGeomStore from '@store/geom.store';
import useEnvStore from '@store/env.store';

const Inner: React.FC<Props> = (props) => {
  const root = useRef<THREE.Group>(null);
  const inner = useGeomStore(({ inners }) => inners[props.id]);
  const envApi = useEnvStore(({ api }) => api);
  const { __envKey, __roomKey } = props;

  // Don't expect `props.id` to change (e.g. 'central-table')
  const innerKey = useRef(`${props.id}.${shortid.generate()}`);
  const roomReady = __envKey && __roomKey;

  // Can change angle and position
  const angle = propsToAngle(props);
  useEffect(() => void (root.current!.rotation.z = angle), [angle]);
  const { x = 0, y = 0 } = props;
  const position = useMemo(() => [x, y, 0] as Coord3, [x, y]);

  useEffect(() => {
    if (inner) {
      const clone = inner.mesh.clone();
      root.current?.add(clone);
      return () => void root.current?.remove(clone);
    }
  }, [inner]);

  useEffect(() => {
    if (roomReady) {
      envApi.registerInner(__roomKey!, innerKey.current);
      return () => {
        envApi.unregisterInner(__roomKey!, innerKey.current);
      };
    }
  }, [roomReady]);

  return (
    <group
      ref={root}
      position={position}
    />
  );
};

export interface ExtraInnerProps {
  /** Auto set by parent Room */
  __envKey?: string;
  /** Auto set by parent Room */
  __roomKey?: string;
}

type Props = TransformProps & ExtraInnerProps & {
  id: string;
}

export default Inner;
