import { ansiBlue, ansiWhite } from "./sh.util";

/** Can be specified via terminal env.PROFILE */
export const profileLookup = {
  'profile-1': () => `

# load util functions
source /etc/util-1
# load game functions
source /etc/game-1

`.trim(),

  'profile-1-a': () => `
${profileLookup["profile-1"]()}

# await world
ready

# hard-coded spawn (TODO spawn points)
spawn andros '{"x":185,"y":390}'
# spawn andros '{"x":598.95,"y":1160.13}'
npc set-player andros

# camera follows andros
track andros &

# click to move
goLoop andros &
# click to look
lookLoop andros &
`,
};

export function isProfileKey(key: string): key is keyof typeof profileLookup {
  return key in profileLookup;
}

/**
 * - Index in array denotes version
 * - We further populate using raw-loader.js below.
 */
export const utilFunctions = [
{
  
range: `{
  call '({args}) =>
    [...Array(Number(args[0]))].map((_, i) => i)
  ' "$1"
}`,
  
seq: `{
  range "$1" | split
}`,
  
pretty: `{
  map '(x, { api }) => api.pretty(x)'
}`,
  
keys: `{
  map Object.keys
}`,

// cat: `get "$@" | split`,
  
/** NOTE `map console.log` would log the 2nd arg too */
log: `{
  map 'x => console.log(x)'
}`,
},
];

/**
 * - Index in array denotes version
 * - We further populate using raw-loader.js below.
 */
export const gameFunctions = [
{

goLoop: `{
  click |
    filter 'x => ["no-ui", "nav"].every(tag => x.tags.includes(tag))' |
    map 'x => ({ npcKey: "'$1'", point: x })' |
    nav |
    walk $1
}`,

goOnce: `{
  nav $1 $(click 1) | walk $1
}`,

lookLoop: `{
  click |
    filter 'x => !x.tags.includes("nav")' |
    look $1
}`,

/**
 * TODO migrate from here
 */

/** npc {action} [{opts}] */
npc: `{
  run '({ api, args, home }) {
    const npcs = api.getCached(home.NPCS_KEY)
    const action = args[0]
    const opts = api.parseJsArg(args[1])
    yield await npcs.npcAct({
      action,
      ...typeof opts === "string"
        ? action.includes("decor") ? { decorKey: opts } : { npcKey: opts }
        : opts,
    })
  }' "$@"
}`,

/** Ping per second until query NPCS_KEY found */
ready: `{
  run '({ api, home }) {
    const cacheKey = home.NPCS_KEY
    yield \`ℹ️  polling for cached query ${ansiBlue}\${cacheKey}${ansiWhite}\`
    while (!api.getCached(cacheKey)) yield* await api.sleep(1)
    yield \`✅  found cached query ${ansiBlue}\${cacheKey}${ansiWhite}\`
  }' "$@"
}`,

/**
 * Spawn character(s) at a position(s),
 * - e.g. `spawn andros "$( click 1 )"`
 * - e.g. `expr '{"npcKey":"andros","point":{"x":300,"y":300}}' | spawn`
 */
spawn: `{
  run '({ api, args, home, datum }) {
    const npcs = api.getCached(home.NPCS_KEY)
    if (api.isTtyAt(0)) {
      const npcKey = args[0]
      const point = api.safeJsonParse(args[1])
      npcs.spawn({ npcKey, point })
    } else {
      while ((datum = await api.read()) !== null)
        npcs.spawn(datum)
    }
  }' "$@"
}`,

/**
 * Track npc
 */
track: `{
  run '({ api, args, home }) {
    const npcKey = args[0]
    const npcs = api.getCached(home.NPCS_KEY)
    const process = api.getProcess()
    const subscription = npcs.trackNpc({ npcKey, process })
    await new Promise(resolve =>
      process.cleanups.push(
        () => subscription.unsubscribe(),
        resolve,
      )
    )
  }' "$@"
}`,

/**
 * TODO handle multiple reads?
 */
view: `{
  run '({ api, args, home }) {
    const opts = Function(\`return \${args[0]} \`)()
    const npcs = api.getCached(home.NPCS_KEY)
    npcs.panZoomTo(opts) // Returns "cancelled" or "completed"
  }' "$@"
}`,

/**
 * Move a specific npc along path(s) e.g.
 * - `walk andros "[$( click 1 ), $( click 1 )]"'
 * - `expr "{ key: 'global-nav', fullPath: [$( click 1 ), $( click 1 )], navMetas: [] }" | walk andros`
 *
 * `npcKey` must be fixed via 1st arg
 */
walk: `{
  run '({ api, args, home, datum, promises = [] }) {
    const npcs = api.getCached(home.NPCS_KEY)
    const npcKey = args[0]

    const process = api.getProcess()
    process.cleanups.push(() => npcs.npcAct({ npcKey, action: "cancel" }))
    process.onSuspends.push(() => npcs.npcAct({ npcKey, action: "pause" }))
    process.onResumes.push(() => npcs.npcAct({ npcKey, action: "play" }))

    if (api.isTtyAt(0)) {
      const points = api.safeJsonParse(args[1])
      await npcs.walkNpc({ npcKey, key: "global-nav", fullPath: points, navMetas: [] })
    } else {
      datum = await api.read()
      while (datum !== null) {
        // Subsequent reads can interrupt walk
        const resolved = await Promise.race([
          promises[0] = npcs.walkNpc({ npcKey, ...datum }),
          promises[1] = api.read(),
        ])
        if (resolved === undefined) {// Finished walk
          datum = await promises[1];
        } else if (resolved === null) {// EOF so finish walk
          await promises[0]
          datum = resolved
        } else {// We read something before walk finished
          await npcs.npcAct({ npcKey, action: "cancel" })
          datum = resolved
        }
      }
    }
  }' "$@"
}`,

},

];

//@ts-ignore
import rawLoaderJs from './raw-loader';
Function('utilFunctions', 'gameFunctions', rawLoaderJs)(utilFunctions, gameFunctions);
console.log({ utilFunctions })

/** This is `/etc` */
export const scriptLookup = {
  'util-1': Object.entries(utilFunctions[0])
    .map(([funcName, funcBody]) => `${funcName} () ${funcBody.trim()}`
  ).join('\n\n'),

  'game-1': Object.entries(gameFunctions[0])
    .map(([funcName, funcBody]) => `${funcName} () ${funcBody.trim()}`
  ).join('\n\n'),
};
