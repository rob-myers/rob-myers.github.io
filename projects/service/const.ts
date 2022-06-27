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
  npcInteractRadius: '--npc-interact-radius',
  npcDebugDisplay: '--npc-debug-display',
  open: 'open',
} as const;

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
