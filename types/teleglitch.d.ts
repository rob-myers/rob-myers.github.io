/**
 * Json version of lua/gfx.lua from teleglitch game files.
 */
export interface Gfx {
  sprites: Sprite[];
  frames: Record<string, Frame[]>;
}

export type Mods = Mod[];

export interface Mod {
  moduleName: string;
  items: ModItem[];
}

export interface ModItem {
  type: 'container'; // TODO
  x: number;
  y: number;
  angle: number;
  "sprite":"spr_puitkast"; // TODO
}

/**
 * Json version of Lua data in teleglitch game files.
 */
export interface Sprite {
  name: string;
  texture: string;
  cols: number;
  rows: number;
  width: number;
  height: number;
  xOffset: number;
  yOffset: number;
  comment?: string;
}

/**
 * Json version of Lua data in teleglitch game files.
 */
export interface Frame {
  /** Name of respective sprite */
  name: string;
  /** Frame identifier, wrt sprite */
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  comment?: string;
}
