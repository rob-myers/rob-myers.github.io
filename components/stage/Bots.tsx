import { StageBot } from "model/stage/stage.model";

const Bots: React.FC<Props> = ({ bot }) => {
  return (
    <group name="Bots">
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
