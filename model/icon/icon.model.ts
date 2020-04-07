import { Rect2 } from '@model/rect2.model';
import { KeyedLookup } from '@model/generic.model';

export type IconType = (
  | 'briefcase'
  | 'notebook'
  | 'smartphone-1'
  | 'computer'
  | 'document-1'
  | 'document-2'
  | 'document-3'
  | 'smartphone'
  | 'user-2'
  | 'user-3'
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
  /**
   * 1
   */
  'briefcase': {
    key: 'briefcase',
    svg: require('./1/briefcase.svg'),
    srcRect: new Rect2(0, 0, 60, 60),
    dstRect: new Rect2(0, 0, 3, 3),
  },
  'notebook': {
    key: 'notebook',
    svg: require('./1/notebook.svg'),
    srcRect: new Rect2(0, 0, 60, 60),
    dstRect: new Rect2(0, 0, 3, 3),
  },
  'smartphone-1': {
    key: 'smartphone-1',
    srcRect: new Rect2(0, 0, 60, 60),
    dstRect: new Rect2(0, 0, 3, 3),
    svg: require('./1/smartphone-1.svg'),
  },
  /**
   * 2
   */
  'computer': {
    key: 'computer',
    svg: require('./2/computer.svg'),
    srcRect: new Rect2(0, 0, 300, 300),
    dstRect: new Rect2(0, 0, 3, 3),
  },
  'document-2': {
    key: 'document-2',
    svg: require('./2/document-2.svg'),
    srcRect: new Rect2(0, 0, 300, 300),
    dstRect: new Rect2(0, 0, 3, 3),
  },
  'document-3': {
    key: 'document-3',
    svg: require('./2/document-3.svg'),
    srcRect: new Rect2(0, 0, 300, 300),
    dstRect: new Rect2(0, 0, 3, 3),
  },
  'smartphone': {
    key: 'smartphone',
    svg: require('./2/smartphone.svg'),
    srcRect: new Rect2(0, 0, 300, 300),
    dstRect: new Rect2(0, 0, 3, 3),
  },
  'user-2': {
    key: 'user-2',
    svg: require('./2/user-2.svg'),
    srcRect: new Rect2(0, 0, 300, 300),
    dstRect: new Rect2(0, 0, 3, 3),
  },
  'user-3': {
    key: 'user-3',
    svg: require('./2/user-3.svg'),
    srcRect: new Rect2(0, 0, 300, 300),
    dstRect: new Rect2(0, 0, 3, 3),
  },
};

