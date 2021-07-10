/**
 * Json version of lua/gfx.lua from teleglitch game files.
 */
export interface Gfx {
  sprites: Sprite[];
  frames: Record<string, Frame[]>;
}

export type Objects = Record<string, Object>;

type Object = {
  sprite: string;
  frame: number;
  collision: 'solid' | 'none' | 'drag';
  shadowdist: number;
  depth: number;
  density?: number;
  breakable?: number;
  brokenframe?: number;
  fovshadows?: number;
} & (
  | { shape: 'rectangle'; width: number; height: number; }
  | { shape: 'circle'; radius: number; }
)

export type Mods = Mod[];

export interface Mod {
  moduleName: string;
  items: ModItem[];
}

export type ModItem = (
  {
    type: 'bmp';
    x: number;
    y: number;
    angle: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    tex: string;
  } | {
    type: 'door';
    x: number;
    y: number;
    angle: number;
    doortype: string;
    sndname: string;
  } | {
    type: 'node';
    x: number;
    y: number;
    angle: number;
    nodetype: 0 | 1 | 2 | 3;
  } | {
    type: (
      | 'amber2'
      | 'amber3'
      | 'arvuti_laud'
      | 'ekraan'
      | 'euroalus'
      | 'kast'
      | 'kast2'
      | 'kraanikauss'
      | 'laeklaas'
      | 'laev6reaeds'
      | 'laud'
      | 'mapmarker'
      | 'must_suur_laekonsool'
      | 'nari'
      | 'punanehallmasinsuur'
      | 'puust_kondeiner'
      | 'punanetoru_laes'
      | 'punanetoru_maass'
      | 'px2_valgusti'
      | 'rest'
      | 'riiul'
      | 'suurkast'
      | 'suurpaak'
      | 'terminal'
      | 'tool'
      | 'valgusti_laeraam_punane'
      | 'v6reaed'
      | 'Punane_pikk_zombitoru'
      | 'Punane_sein_kriimustustega'
      | 'Punane_8px_lai_siksak_laev6re'
      | 'Punane_8px_lai_siksak_laev6re_pikka_sammuga'
      | 'Punane_v2ike_tynn'
      | 'Valgusti'
    );
    x: number;
    y: number;
    angle: number;
    frame: number;
    funcname?: string;
  } | {
    type: 'soundemitter';
    x: number;
    y: number;
    angle: number;
    minradius: number;
    maxradius: number;
    maxvolume: number;
    pitch: 1;
    soundname: string;
  } | {
    type: 'container';
    x: number;
    y: number;
    angle: number;
    sprite: string;
  } | {
    type: (
      | 'emptycan'
      | 'giant_zombie'
      | 'directioncontroller'
    );
    x: number;
    y: number;
    angle: number;
  } | {
    type: 'sein_peez';
    x: number;
    y: number;
    angle: number;
    frame: number;
    r?: number;
    g?: number;
    b?: number;
  } | {
    type: 'light';
    x: number;
    y: number;
    angle: number;
    radius: number;
    brightness: number;
  } | {
    type: 'pfv';
    id: number;
    x: number;
    y: number;
    angle: number;
    r: number;
    g: number;
    b: number;
  } | {
    type: 'pfp';
    verts: number[];
  }
);

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
