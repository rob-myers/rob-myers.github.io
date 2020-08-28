import { useRef, useEffect } from "react";
import useStore from "@store/geom.store";

const dirToAngle = {
  0: 0, // east
  1: -Math.PI/2, // south
  2: Math.PI, // west
  3: Math.PI/2, // north
};

const Room: React.FC<Props> = (props) => {
  const { is: name, at = [0, 0] } = props;
  const meta = useStore(({ rooms }) => rooms[name]);
  const group = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (meta) {
      const clone = meta.mesh.clone();
      group.current!.add(clone);
      return () => void group.current?.remove(clone);
    }
  }, [meta]);

  const dir = 'e' in props ? 0
    : 's' in props ? 1
    : 'w' in props ? 2
    : 'n' in props ? 3 : 0;
  useEffect(() => {
    group.current!.rotation.y = dirToAngle[dir];
  }, [dir]);

  return (
    <group
      ref={group}
      position={[at[0], at[1], 0]}
      rotation={[Math.PI/2, 0, 0]}
    />
  )
};

type Props = {
  is: string;
  at?: [number, number];
} & (
  | { e?: boolean }
  | { s?: boolean }
  | { w?: boolean }
  | { n?: boolean }
)

export default Room;
