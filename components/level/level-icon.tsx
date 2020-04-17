import { useEffect, useRef } from 'react';
import { Icon } from '@model/icon/icon.model';
import { Vector2 } from '@model/vec2.model';

export const LevelIcon: React.FC<Props> = ({ icon, position }) => {
  const el = useRef<SVGGElement>(null);
  useEffect(() => {
    el.current!.innerHTML = icon.svg;
    console.log('set svg', icon.key);
  }, [icon.key]);

  return (
    <g
      ref={el}
      style={{ transform: `translate(${position.x - icon.delta.x}px, ${position.y - icon.delta.y}px) scale(${icon.scale})`}}
      // dangerouslySetInnerHTML={{ __html: icon.svg }}
    />
  );
};

interface Props {
  icon: Icon;
  position: Vector2;
}
