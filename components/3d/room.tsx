import { useRef, useEffect, useCallback } from "react";
import { MouseEvent as ThreeMouseEvent } from 'react-three-fiber';
import useStore from "@store/geom.store";
import { Coord3 } from "@model/three/three.model";

const undoGltfRotation = [Math.PI/2, 0, 0] as Coord3;

const Room: React.FC<Props> = (props) => {
  const { is, at = [0, 0], high } = props;
  const meta = useStore(({ rooms }) => rooms[is]);
  const api = useStore(({ api }) => api);
  const group = useRef<THREE.Group>(null);
  
  const onClick = useCallback((e: ThreeMouseEvent) => {
    console.log({ clickedRoom: e })
    e.stopPropagation();
  }, []);

  useEffect(() => {
    if (meta) {
      const clone = meta.mesh.clone();
      group.current?.add(clone);
      return () => void group.current?.remove(clone);
    }
  }, [meta]);

  const angle = propsToAngle(props);
  useEffect(() => void (group.current!.rotation.y = angle), [angle]);

  return (
    <group
      ref={group}
      position={[at[0], at[1], 0]}
      rotation={undoGltfRotation}
      onClick={onClick}
    />
  )
};

function propsToAngle(props: Props) {
  return 'e' in props ? 0
    : 's' in props ? -Math.PI/2
    : 'w' in props ? Math.PI
    : 'n' in props ? Math.PI/2 : 0;
}

type Props = {
  is: string;
  at?: [number, number];
  high?: boolean;
} & (
  | { e?: boolean }
  | { s?: boolean }
  | { w?: boolean }
  | { n?: boolean }
)

export default Room;
