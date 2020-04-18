import { Icon } from '@model/icon/icon.model';
import { Vector2 } from '@model/vec2.model';

export const LevelIcon: React.FC<Props> = ({ icon, position }) => {
  return (
    <g
      style={{
        userSelect: 'none',
        transform: `translate(${position.x - icon.delta.x}px, ${position.y - icon.delta.y}px) scale(${icon.scale})`,
      }}
      dangerouslySetInnerHTML={{ __html: icon.svg }}
    />
  );
};

interface Props {
  icon: Icon;
  position: Vector2;
}
