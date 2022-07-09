export const cssName = {
  door: 'door',
  doors: 'doors',
  doorTouchUi: 'door-touch-ui',
  hull: 'hull',
  iris: 'iris',
  navMain: 'nav-main',
  navMainOpen: 'open',
  navMainClosed: 'closed',
  navMini: 'nav-mini',

  npcsDebugDisplay: '--npcs-debug-display',
  npcsInteractRadius: '--npcs-interact-radius',

  npcBoundsRadius: '--npc-bounds-radius',
  /**
   * Angle of body when last idle e.g. `0rad`. Carries additional info,
   * i.e. modulus of `2 * Math.PI`, ensuring we turn the smaller angle.
   */
  npcTargetLookAngle: '--npc-target-look-angle',
  open: 'open',
} as const;

/** Decimal place precision */
export const precision = 4;

//#region npcs

/** `24 / 5` because we scale down SVG symbols */
export const doorWidth = 4.8;

export const hullDoorWidth = 12;

/**
 * Removing this outset breaks navigation,
 * e.g. walls of geomorph 301 are no longer connected.
 */
export const hullOutset = 2;

export const wallOutset = 15;

export const obstacleOutset = 10;

export const lightDoorOffset = 40;

export const lightWindowOffset = 20;

//#endregion