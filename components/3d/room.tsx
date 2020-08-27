import { useRef, useEffect } from "react";
import useStore from "@store/geom.store";

const dirToAngle = {
  e: 0,
  s: -Math.PI/2,
  w: Math.PI,
  n: Math.PI/2,
};

const Room: React.FC<Props> = ({ name, at = [0, 0], to = 'e' }) => {
  const meta = useStore(({ rooms }) => rooms[name]);
  const group = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (meta) {
      const clone = meta.mesh.clone();
      group.current!.add(clone);
      return () => void group.current?.remove(clone);
    }
  }, [meta]);

  useEffect(() => {
    group.current!.rotation.y = dirToAngle[to];
  }, [to]);

  return (
    <group
      ref={group}
      position={[at[0], at[1], 0]}
      rotation={[Math.PI/2, 0, 0]}
    />
  )
};

interface Props {
  name: string;
  at?: [number, number];
  to?: 'e' | 's' | 'w' | 'n'; 
}

export default Room;
