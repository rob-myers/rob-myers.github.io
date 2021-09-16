const layoutDefs = {
  'g-301--bridge': /** @type {Geomorph.LayoutDef} */ ({
    key: 'g-301--bridge',
    id: 301,
    items: [
      { symbol: '301--hull', tags: ['door']  }, // Hull must be first
      { symbol: 'misc-stellar-cartography--023--4x4', transform: [-1, 0, 0, 1, 1200, 360] },
      { symbol: 'stateroom--014--2x2', transform: [1, 0, 0, -1, 0, 480] },
      { symbol: 'stateroom--014--2x2', transform: [1, 0, 0, -1, 120, 480] },
      { symbol: 'office--001--2x2', transform: [-1, 0, 0, 1, 240, 120], tags: ['door-s'] },
      { symbol: 'office--001--2x2', transform: [1, 0, 0, 1, 960, 120], tags: ['door-s'] },
      { symbol: 'stateroom--036--2x4' },
      { symbol: 'stateroom--036--2x4', transform: [-1, 0, 0, 1, 1200, 0] },
      { symbol: 'stateroom--036--2x4', transform: [0, -1, 1, 0, 0, 600] },
      { symbol: 'bridge--042--8x9', transform: [1, 0, 0, 1, 360, 60] },
      { symbol: 'iris-valves--005--1x1', transform: [0, -1, 1, 0, 0, 360] },
      { symbol: 'iris-valves--005--1x1', transform: [0, 1, 1, 0, 1140, 240] },
      { symbol: 'iris-valves--005--1x1', transform: [-1, 0, 0, 1, 360, 540] },
      { symbol: 'iris-valves--005--1x1', transform: [-1, 0, 0, 1, 960, 540] },
      { symbol: 'console--031--1x1.2', transform: [-1, 0, 0, 1, 360, 60] },
      { symbol: 'console--031--1x1.2', transform: [1, 0, 0, 1, 840, 60] },
      { symbol: 'weaponry--013--1x2', transform: [-1, 0, 0, 1, 360, -60] },
      { symbol: 'weaponry--013--1x2', transform: [1, 0, 0, 1, 840, -60] },
    ],
  }),
  'g-302--xboat-repair-bay': /** @type {Geomorph.LayoutDef} */ ({
    key: 'g-302--xboat-repair-bay',
    id: 302,
    items: [
      { symbol: '302--hull' },
      { symbol: 'office--006--2x2', transform: [0, 1, -1, 0, 120, 120], tags: ['door-e'] },
      { symbol: 'lounge--015--2x4', transform: [-1, 0, 0, -1, 480, 540] },
      { symbol: 'window--007--0x2.4', transform: [1, 0, 0, 1, 240, 420 - 8] },
      { symbol: 'empty-room--006--2x2', transform: [0, 1, -1, 0, 600, 420], tags: ['door-e'] },
      { symbol: 'ships-locker--011--1x2', transform: [0, 1, 1, 0, 540, 420] },
    ],
  }),
};

export default layoutDefs;