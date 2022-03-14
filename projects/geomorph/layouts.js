/**
 * Hull symbol must be first.
 * @type {Record<Geomorph.LayoutKey, Geomorph.LayoutDef>}
 */
const layoutDefs = {
  'g-101--multipurpose': {
    key: 'g-101--multipurpose',
    id: 101,
    items: [
      { symbol: '101--hull' },
      { symbol: 'fuel--010--2x4' },
      { symbol: 'fuel--010--2x4', transform: [1, 0, 0, 1, 360, 0] },
      { symbol: 'fuel--010--2x4', transform: [1, 0, 0, 1, 600, 0] },
      { symbol: 'iris-valves--005--1x1', transform: [1, 0, 0, 1, 840, 0] },
      { symbol: 'fuel--010--2x4', transform: [1, 0, 0, 1, 960, 0] },

      { symbol: 'machinery--158--1.8x3.6', transform: [0, -1, 1, 0, 0, 240 + 5] },
      { symbol: 'stateroom--020--2x3', transform: [0, 1, 1, 0, 360, 120] },
      { symbol: 'fresher--020--2x2', transform: [0, 1, 1, 0, 540, 120] },
      { symbol: 'lounge--009--2x3', transform: [-1, 0, 0, -1, 840, 240] },
      { symbol: 'machinery--155--1.8x3.6', transform: [0, -1, 1, 0, 960 + 12, 240 - 4] },
      
      { symbol: 'iris-valves--005--1x1', transform: [0, -1, 1, 0, 0, 360] },
      { symbol: 'stateroom--018--2x3', transform: [1, 0, 0, 1, 360, 240] },
      { symbol: 'stateroom--019--2x3', transform: [-1, 0, 0, -1, 840, 420] },

      { symbol: 'empty-room--013--2x3', transform: [0, 1, -1, 0, 180, 360] },
      { symbol: 'medical--008--2x3', transform: [0, -1, -1, 0, 360, 540], doors: ['w'] },
      { symbol: 'stateroom--020--2x3', transform: [0, -1, 1, 0, 360, 540] },
      { symbol: 'stateroom--020--2x3', transform: [0, -1, -1, 0, 840, 540] },
      { symbol: 'fresher--025--2x3', transform: [0, -1, 1, 0, 840, 540] },
      { symbol: 'office--023--2x3', transform: [0, -1, -1, 0, 1200, 480] },
      
      { symbol: 'empty-room--039--3x4', transform: [-1, 0, 0, 1, 180, 480], walls: ['w'] },
      { symbol: 'lifeboat--small-craft', transform: [1, 0, 0, 1, 0, 480 + 8] },
      { symbol: 'medical--007--2x3', transform: [0, 1, -1, 0, 360, 660], doors: ['w'] },
      { symbol: 'office--026--2x3', transform: [0, 1, -1, 0, 540, 660] },
      { symbol: 'office--026--2x3', transform: [0, 1, 1, 0, 660, 660] },
      
      { symbol: 'office--020--2x3', transform: [1, 0, 0, 1, 360, 780] },
      { symbol: 'office--020--2x3', transform: [-1, 0, 0, 1, 840, 780] },

      { symbol: 'empty-room--013--2x3', transform: [0, -1, -1, 0, 180, 840], walls: ['n'] },
      { symbol: 'fresher--025--2x3', transform: [0, 1, 1, 0, 840, 660] },
      { symbol: 'office--061--3x4', transform: [1, 0, 0, 1, 1020, 480] },
      { symbol: 'office--023--2x3', transform: [0, 1, -1, 0, 1200, 720] },
      { symbol: 'iris-valves--005--1x1', transform: [0, 1, 1, 0, 1140, 840] },

      { symbol: 'machinery--091--1.6x1.8', transform: [1, 0, 0, 1, 540 + 10, 960] },
      { symbol: 'office--025--2x3', transform: [0, 1, 1, 0, 360, 960], doors: ['w'] },
      { symbol: 'machinery--156--1.8x3.6', transform: [0, -1, 1, 0, 0, 1080 - 6] },
      { symbol: 'office--025--2x3', transform: [0, 1, -1, 0, 840, 960], doors: ['w'] },
      { symbol: 'machinery--357--2.2x4', transform: [1, 0, 0, 1, 960, 960] },

      { symbol: 'fuel--010--2x4', transform: [1, 0, 0, 1, 0, 1080] },
      { symbol: 'iris-valves--005--1x1', transform: [-1, 0, 0, 1, 360, 1140] },
      { symbol: 'fuel--010--2x4', transform: [1, 0, 0, 1, 360, 1080] },
      { symbol: 'fuel--010--2x4', transform: [1, 0, 0, 1, 600, 1080] },
      { symbol: 'fuel--010--2x4', transform: [1, 0, 0, 1, 960, 1080] },
    ],
  },

  'g-102--research-deck': {
    key: 'g-102--research-deck',
    id: 102,
    items: [
      { symbol: '102--hull' },
      { symbol: 'empty-room--060--4x4', transform: [1, 0, 0, -1, 0, 240] },
      { symbol: 'machinery--158--1.8x3.6', transform: [1, 0, 0, 1, + 5, 0] },
      { symbol: 'machinery--065--1.8x1.8', transform: [1, 0, 0, 1, 240 - 4, 240 - 2] },
      { symbol: 'console--018--1x1', transform: [-1, 0, 0, 1, 240, 0] },
      { symbol: 'iris-valves--005--1x1', transform: [0, -1, 1, 0, 0, 360] },
      { symbol: 'lab--018--4x4', transform: [1, 0, 0, -1, 360, 240] },
      { symbol: 'lab--018--4x4', transform: [1, 0, 0, -1, 600, 240] },

      { symbol: 'iris-valves--005--1x1', transform: [1, 0, 0, 1, 840, 0] },
      
      { symbol: 'machinery--156--1.8x3.6', transform: [1, 0, 0, 1, +5, 360] },
      { symbol: 'office--004--2x2', transform: [0, 1, 1, 0, 420, 360], doors: ['w'] },
      { symbol: 'office--004--2x2', transform: [0, 1, 1, 0, 540, 360], doors: ['w'] },
      { symbol: 'stateroom--012--2x2', transform: [0, -1, -1, 0, 540, 600] },
      { symbol: 'stateroom--012--2x2', transform: [0, -1, -1, 0, 660, 600] },

      { symbol: 'misc-stellar-cartography--020--10x10', transform: [-1, 0, 0, 1, 600, 600] },
      { symbol: 'iris-valves--005--1x1', transform: [0, 1, 1, 0, 1140, 840] },
    ],
  },

  'g-301--bridge': {
    key: 'g-301--bridge',
    id: 301,
    items: [
      { symbol: '301--hull' }, // Hull must be first
      { symbol: 'weaponry--013--1x2', transform: [-1, 0, 0, 1, 360, -60] },
      { symbol: 'weaponry--013--1x2', transform: [1, 0, 0, 1, 840, -60] },

      { symbol: 'stateroom--036--2x4' },
      { symbol: 'office--001--2x2', transform: [-1, 0, 0, 1, 240, 120], doors: ['s'] },
      { symbol: 'bridge--042--8x9', transform: [1, 0, 0, 1, 360, 60] },
      { symbol: 'office--001--2x2', transform: [1, 0, 0, 1, 960, 120], doors: ['s'] },
      { symbol: 'stateroom--036--2x4', transform: [-1, 0, 0, 1, 1200, 0] },

      { symbol: 'stateroom--014--2x2', transform: [1, 0, 0, -1, 0, 480] },
      { symbol: 'stateroom--014--2x2', transform: [1, 0, 0, -1, 120, 480] },

      { symbol: 'stateroom--036--2x4', transform: [0, -1, 1, 0, 0, 600] },
      { symbol: 'iris-valves--005--1x1', transform: [0, -1, 1, 0, 0, 360] },
      { symbol: 'iris-valves--005--1x1', transform: [0, 1, 1, 0, 1140, 240] },
      { symbol: 'iris-valves--005--1x1', transform: [-1, 0, 0, 1, 360, 540] },
      { symbol: 'iris-valves--005--1x1', transform: [-1, 0, 0, 1, 960, 540] },
      { symbol: 'console--031--1x1.2', transform: [-1, 0, 0, 1, 360, 60] },
      { symbol: 'console--031--1x1.2', transform: [1, 0, 0, 1, 840, 60] },
      { symbol: 'misc-stellar-cartography--023--4x4', transform: [-1, 0, 0, 1, 1200, 360] },
    ],
  },
  'g-302--xboat-repair-bay': {
    key: 'g-302--xboat-repair-bay',
    id: 302,
    items: [
      { symbol: '302--hull' },
      { symbol: 'office--006--2x2', transform: [0, 1, -1, 0, 120, 120], doors: ['e', 'w'] },
      { symbol: 'empty-room--020--2x4', transform: [-1, 0, 0, 1, 1200, 0], doors: ['s'] },

      { symbol: 'lounge--015--2x4', transform: [-1, 0, 0, -1, 480, 540] },
      { symbol: 'window--007--0x2.4', transform: [1, 0, 0, 1, 240, 420 - 8] },
      { symbol: 'empty-room--006--2x2', transform: [0, 1, -1, 0, 600, 420], doors: ['e'] },
      { symbol: 'ships-locker--011--1x2', transform: [0, 1, 1, 0, 540, 420] },
      { symbol: 'iris-valves--005--1x1', transform: [0, 1, -1, 0, 1200, 240] },
      { symbol: 'shop--028--0.8x1.6', transform: [0, 1, -1, 0, 660, 420] },
      { symbol: 'shop--027--0.4x1.6', transform: [-1, 0, 0, 1, 900, 480] },
      { symbol: 'sensors--003--1x1.4', transform: [...getAngleMatrix(45), 90 + 5, -60 + 1] },
    ],
  },
  "g-303--passenger-deck": {
    key: 'g-303--passenger-deck',
    id: 303,
    items: [
      { symbol: '303--hull' },

      { symbol: 'medical-bed--006--1.6x3.6', transform: [1, 0, 0, 1, 4, 10] },
      { symbol: 'low-berth--003--1x1', transform: [0, 1, -1, 0, 240, 0] },
      { symbol: 'console--022--1x2', transform: [-1, 0, 0, 1, 240, 60] },
      { symbol: 'stateroom--035--2x3', transform: [1, 0, 0, 1, 240, 0] },
      { symbol: 'stateroom--035--2x3', transform: [1, 0, 0, 1, 360, 0] },
      { symbol: 'stateroom--035--2x3', transform: [1, 0, 0, 1, 480, 0] },
      { symbol: 'stateroom--035--2x3', transform: [-1, 0, 0, 1, 720, 0] },
      { symbol: 'stateroom--100--3x4', transform: [0, -1, -1, 0, 960, 180] },
      { symbol: 'galley-and-mess-halls--006--2x4', transform: [-1, 0, 0, 1, 1200, 0] },
      { symbol: 'table--009--0.8x0.8', transform: [1, 0, 0, 1, 960, 120] },
      { symbol: 'table--009--0.8x0.8', transform: [1, 0, 0, 1, 960, 240 - 2] },
      
      { symbol: 'iris-valves--005--1x1', transform: [0, 1, 1, 0, 1140, 240 + 2] },
      { symbol: 'fresher--002--0.4x0.6', transform: [1, 0, 0, -1, 200, 300] },
      { symbol: 'gaming-tables--001--1x2', transform: [1, 0, 0, 1, 480, 240] },
      { symbol: 'couch-and-chairs--006--0.4x2', transform: [1, 0, 0, -1, 660 + 10, 360] },
      { symbol: 'couch-and-chairs--006--0.4x2', transform: [0, 1, -1, 0, 840, 240] },

      { symbol: 'machinery--077--1.6x1.8', transform: [0, 1, -1, 0, 160, 380] },
      { symbol: 'machinery--077--1.6x1.8', transform: [-1, 0, 0, 1, 220, 440] },
      { symbol: 'console--018--1x1', transform: [-1, 0, 0, 1, 120, 480] },
      { symbol: 'iris-valves--005--1x1', transform: [-1, 0, 0, 1, 360, 540] },
      { symbol: 'stateroom--036--2x4', transform: [1, 0, 0, -1, 360, 600] },
      { symbol: 'stateroom--036--2x4', transform: [1, 0, 0, -1, 480, 600] },
      { symbol: 'stateroom--036--2x4', transform: [-1, 0, 0, -1, 720, 600] },
      { symbol: 'stateroom--036--2x4', transform: [-1, 0, 0, -1, 840, 600] },
      { symbol: 'office--089--4x4', transform: [-1, 0, 0, 1, 1200, 360] },

      // Draw later so above rooms
      { symbol: 'window--001--0x1', transform: [1, 0, 0, 1, 90, -6] },
      { symbol: 'window--001--0x1', transform: [1, 0, 0, 1, 270, -6] },
      { symbol: 'window--001--0x1', transform: [1, 0, 0, 1, 390, -6] },
      { symbol: 'window--001--0x1', transform: [1, 0, 0, 1, 510, -6] },
      { symbol: 'window--001--0x1', transform: [1, 0, 0, 1, 630, -6] },
    ],
  },
};

export default layoutDefs;

/**
 * @param {number} degrees 
 * @returns {[number, number, number, number]}
 */
function getAngleMatrix(degrees) {
  const rads = degrees * (Math.PI / 180);
  return [
    Math.cos(rads), // a
    Math.sin(rads), // b
    -Math.sin(rads),// c
    Math.cos(rads), // d
  ];
}
