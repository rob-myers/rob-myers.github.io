import { StageBot } from "model/stage/stage.model";

const Bots: React.FC<Props> = ({ bot }) => {
  return (
    <group name="Bots">
      {Object.values(bot).map(({ name, root }) => (
        <primitive key={name} object={root} />
      ))}
    </group>
  );
};

export interface Props {
  bot: StageBot;
}

export default Bots;
