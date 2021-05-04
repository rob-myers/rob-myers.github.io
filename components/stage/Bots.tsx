import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { StageBot } from "model/stage/stage.model";

const Bots: React.FC<Props> = ({ bot }) => {
  const root = useRef<THREE.Group>(null);

  // useFrame((_, delta) => Object.values(bot).forEach(x => x.mixer.update(delta)));

  useEffect(() => {
    // for (const { mixer, clips } of Object.values(bot)) {
    //   if (!mixer.existingAction(clips[0])) {
    //     mixer.clipAction(clips[0]).play();
    //   }
    // }
  }, [bot]);

  return (
    <group name="Bots" ref={root}>
      {Object.values(bot).map(({ name, group }) => (
        <primitive key={name} object={group} />
      ))}
    </group>
  );
};

export interface Props {
  bot: StageBot;
}

export default Bots;
