import { Rect2 } from '@model/rect2.model';
import { KeyedLookup } from '@model/generic.model';

export type IconType = (
  | 'door-1'
);

interface IconMeta {
  /** Unique identifier */
  key: IconType;
  /** Source SVG as plain text */
  svg: string;
  /** Rectangular area to select from source SVG */
  srcRect: Rect2;
  /** Rectangular area in world coords */
  dstRect: Rect2;
}

export const iconLookup: KeyedLookup<IconMeta, IconType> = {
  'door-1': {
    key: 'door-1',
    svg: require('./door-1.svg'),
    srcRect: new Rect2(0, 0, 100, 100),
    dstRect: new Rect2(0, 0, 3, 3),
  },
};
