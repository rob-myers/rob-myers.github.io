import { Icon, createIcon } from '@model/icon/icon.model';
import { Vector2 } from '@model/vec2.model';

const defaultIcon = createIcon('meta-1');

export const LevelIcon: React.FC<Props> = ({
  icon = defaultIcon,
  position,
  highlight,
}) => {
  return (
    <>
      <g
        style={{
          userSelect: 'none',
          transform: `translate(${position.x - icon.delta.x}px, ${position.y - icon.delta.y}px) scale(${icon.scale})`,
        }}
        dangerouslySetInnerHTML={{ __html: icon.svg }}
      />
      { highlight && (
        <circle
          cx={position.x}
          cy={position.y}
          r={icon.rect.dimension / 2}
          fill="none"
          stroke="red"
          strokeWidth="0.1"
        />
      )}
    </>
  );
};

interface Props {
  icon?: Icon;
  position: Vector2;
  highlight?: boolean;
}
