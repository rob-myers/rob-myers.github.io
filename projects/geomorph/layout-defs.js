const layoutDefs = {
  'g-101--multipurpose': /** @type {Geomorph.LayoutDef} */ ({
    key: 'g-101--multipurpose',
    id: 101,
    items: [
      { symbol: '101--hull' },
      { symbol: 'fuel--010--2x4' },
      { symbol: 'fuel--010--2x4', transform: [1, 0, 0, 1, 360, 0] },
      { symbol: 'fuel--010--2x4', transform: [1, 0, 0, 1, 600, 0] },
      { symbol: 'iris-valves--005--1x1', transform: [1, 0, 0, 1, 840, 0] },
      { symbol: 'fuel--010--2x4', transform: [1, 0, 0, 1, 960, 0] },

      { symbol: 'machinery--158--1.8x3.6', transform: [0, -1, 1, 0, +10, 240] },
      { symbol: 'stateroom--020--2x3', transform: [0, 1, 1, 0, 360, 120] },
      { symbol: 'fresher--020--2x2', transform: [0, 1, 1, 0, 540, 120] },
      { symbol: 'lounge--009--2x3', transform: [-1, 0, 0, -1, 840, 240] },
      { symbol: 'machinery--155--1.8x3.6', transform: [0, -1, 1, 0, 960 + 12, 240 - 4] },
      
      { symbol: 'iris-valves--005--1x1', transform: [0, -1, 1, 0, 0, 360] },
      { symbol: 'stateroom--018--2x3', transform: [1, 0, 0, 1, 360, 240] },
      { symbol: 'stateroom--019--2x3', transform: [-1, 0, 0, -1, 840, 420] },

      { symbol: 'empty-room--013--2x3', transform: [0, 1, -1, 0, 180, 360] },
      { symbol: 'medical--008--2x3', transform: [0, -1, -1, 0, 360, 540], doors: ['door-w'] },
      { symbol: 'stateroom--020--2x3', transform: [0, -1, 1, 0, 360, 540] },
      { symbol: 'stateroom--020--2x3', transform: [0, -1, -1, 0, 840, 540] },
      { symbol: 'fresher--025--2x3', transform: [0, -1, 1, 0, 840, 540] },
      { symbol: 'office--023--2x3', transform: [0, -1, -1, 0, 1200, 480] },
      
      { symbol: 'empty-room--039--3x4', transform: [-1, 0, 0, 1, 180, 480], walls: ['wall-w'] },
      { symbol: 'lifeboat', transform: [1, 0, 0, 1, 0, 480 + 8] },
      { symbol: 'medical--007--2x3', transform: [0, 1, -1, 0, 360, 660], doors: ['door-w'] },
      { symbol: 'office--026--2x3', transform: [0, 1, -1, 0, 540, 660] },
      { symbol: 'office--026--2x3', transform: [0, 1, 1, 0, 660, 660] },
      
      { symbol: 'office--020--2x3', transform: [1, 0, 0, 1, 360, 780] },
      { symbol: 'office--020--2x3', transform: [-1, 0, 0, 1, 840, 780] },

      // { symbol: 'empty-room--013--2x3', transform: [0, -1, -1, 0, 180, 840] },
      { symbol: 'fresher--025--2x3', transform: [0, 1, 1, 0, 840, 660] },
      { symbol: 'office--061--3x4', transform: [1, 0, 0, 1, 1020, 480] },
      { symbol: 'office--023--2x3', transform: [0, 1, -1, 0, 1200, 720] },
      { symbol: 'iris-valves--005--1x1', transform: [0, 1, 1, 0, 1140, 840] },

      { symbol: 'machinery--091--1.6x1.8', transform: [1, 0, 0, 1, 540 + 10, 960] },
      { symbol: 'office--025--2x3', transform: [0, 1, 1, 0, 360, 960], doors: ['door-w'] },
      { symbol: 'machinery--156--1.8x3.6', transform: [0, -1, 1, 0, +12, 1080 - 12] },
      { symbol: 'office--025--2x3', transform: [0, 1, -1, 0, 840, 960], doors: ['door-w'] },
      { symbol: 'machinery--357--2.2x4', transform: [1, 0, 0, 1, 960, 960] },

      { symbol: 'fuel--010--2x4', transform: [1, 0, 0, 1, 0, 1080] },
      { symbol: 'iris-valves--005--1x1', transform: [-1, 0, 0, 1, 360, 1140] },
      { symbol: 'fuel--010--2x4', transform: [1, 0, 0, 1, 360, 1080] },
      { symbol: 'fuel--010--2x4', transform: [1, 0, 0, 1, 600, 1080] },
      { symbol: 'fuel--010--2x4', transform: [1, 0, 0, 1, 960, 1080] },
    ],
  }),
  'g-301--bridge': /** @type {Geomorph.LayoutDef} */ ({
    key: 'g-301--bridge',
    id: 301,
    items: [
      { symbol: '301--hull'  }, // Hull must be first
      { symbol: 'misc-stellar-cartography--023--4x4', transform: [-1, 0, 0, 1, 1200, 360] },
      { symbol: 'stateroom--014--2x2', transform: [1, 0, 0, -1, 0, 480] },
      { symbol: 'stateroom--014--2x2', transform: [1, 0, 0, -1, 120, 480] },
      { symbol: 'office--001--2x2', transform: [-1, 0, 0, 1, 240, 120], doors: ['door-s'] },
      { symbol: 'office--001--2x2', transform: [1, 0, 0, 1, 960, 120], doors: ['door-s'] },
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
      { symbol: 'office--006--2x2', transform: [0, 1, -1, 0, 120, 120], doors: ['door-e'] },
      { symbol: 'lounge--015--2x4', transform: [-1, 0, 0, -1, 480, 540] },
      { symbol: 'window--007--0x2.4', transform: [1, 0, 0, 1, 240, 420 - 8] },
      { symbol: 'empty-room--006--2x2', transform: [0, 1, -1, 0, 600, 420], doors: ['door-e'] },
      { symbol: 'ships-locker--011--1x2', transform: [0, 1, 1, 0, 540, 420] },
      { symbol: 'iris-valves--005--1x1', transform: [0, 1, -1, 0, 1200, 240] },
      { symbol: 'empty-room--020--2x4', transform: [-1, 0, 0, 1, 1200, 0], doors: ['door-s'] },
      { symbol: 'shop--028--0.8x1.6', transform: [0, 1, -1, 0, 660, 420] },
      { symbol: 'shop--027--0.4x1.6', transform: [-1, 0, 0, 1, 900, 480] },
      { symbol: 'sensors--003--1x1.4', transform: [...getAngle(45), 90 + 5, -60 + 1] },
    ],
  }),
};

export default layoutDefs;

/**
 * @param {number} degrees 
 * @returns {[number, number, number, number]}
 */
function getAngle(degrees) {
  const rads = (degrees / 360) * (2 * Math.PI);
  return [Math.cos(rads), Math.sin(rads), -Math.sin(rads), Math.cos(rads)];
}