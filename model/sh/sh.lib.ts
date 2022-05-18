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
# camera follows andros
# track andros &

`,
};

export function isProfileKey(key: string): key is keyof typeof profileLookup {
  return key in profileLookup;
}

// Index in array denotes version
export const utilFunctions = [
{
/** Evaluate and return a javascript expression */
expr: `{
  run '({ api, args }) {
    const input = args.join(" ")
    yield api.parseJsArg(input)
  }' "$@"
}`,
  
/** Execute a javascript function */
call: `{
  run '(ctxt) {
    const func = Function(\`return \${ctxt.args[0]}\`)()
    ctxt.args = ctxt.args.slice(1)
    yield await func(ctxt)
  }' "$@"
}`,
  
/** Filter inputs */
filter: `{
  run '(ctxt) {
    let { api, args, datum } = ctxt
    const func = Function(\`return \${args[0]}\`)()
    while ((datum = await api.read()) !== null)
      if (func(datum, ctxt)) yield datum
  }' "$@"
}`,
  
/** Apply function to each item from stdin */
map: `{
  run '(ctxt) {
    let { api, args, datum } = ctxt
    const func = Function(\`return \${args[0]}\`)()
    while ((datum = await api.read(true)) !== null) {
      if (datum.__chunk__) yield { ...datum, items: datum.items.map(x => func(x, ctxt)) }
      else yield func(datum, ctxt)
    }
  }' "$@"
}`,
  
poll: `{
  run '({ api, args }) {
    yield* api.poll(args)
  }' "$@"
}`,
  
/** Reduce all items from stdin */
reduce: `{
  run '({ api, args }) {
    const inputs = []
    const reducer = Function(\`return \${args[0]}\`)()
    while ((datum = await api.read()) !== null)
      inputs.push(datum)
    yield args[1]
      ? inputs.reduce(reducer, api.parseJsArg(args[1]))
      : inputs.reduce(reducer)
  }' "$@"
}`,

/**
 * Split arrays from stdin into items.
 * Split strings by optional separator (default `''`).
 * Otherwise ignore.
 */
split: `{
  run '({ api, args }) {
    const arg = args[0] || ""
    while ((datum = await api.read()) !== null) {
      if (datum instanceof Array) {
        // yield* datum
        yield { __chunk__: true, items: datum };
      } else if (typeof datum === "string") {
        // yield* datum.split(arg)
        yield { __chunk__: true, items: datum.split(arg) };
      }
    }
  }' "$@"
}`,
  
/** Collect stdin into a single array */
sponge: `{
  run '({ api }) {
    const outputs = []
    while ((datum = await api.read()) !== null)
      outputs.push(datum)
    yield outputs
  }'
}`,
  
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
  
    // NOTE 'map console.log' would log the 2nd arg too
log: `{
  map 'x => console.log(x)'
}`,
},
];

// TODO change api
// - ready, npc, spawn, nav, walk ✅
// - ...
export const gameFunctions = [
{
/**
 * Output world position clicks sent via WIRE_KEY.
 * e.g. `click`, `click 1`
 */
click: `{
  run '({ api, args, home }) {
    const numClicks = args[0] === "" ? Number.MAX_SAFE_INTEGER : Number(args[0])
    if (!Number.isFinite(numClicks)) {
      api.throwError("format: \`click [{numberOfClicks}]\`")
    }

    // TODO provide rxjs operators and pipe npcs.getPanZoomEvents()

    yield* await api.mapWire(
      (e) => e.key === "pointerup"
        ? { x: Number(e.point.x.toFixed(2)), y: Number(e.point.y.toFixed(2)) }
        : undefined,
      (_, count) => count >= numClicks,
    )
  }' "$@"
}`,

/**
 * Spawn a character at a position.
 * e.g. `spawn andros "$( click 1 )"`
 */
spawn: `{
  run '({ api, args, home }) {
    const npcKey = args[0]
    const position = api.safeJsonParse(args[1])
    const npcs = api.getCached(\`npcs@\${home.WIRE_KEY}\`)
    // TODO can spawn many by reading
    npcs.spawn({ npcKey, at: position })
  }' "$@"
}`,

/**
 * Request navpath to position for character via WIRE_KEY.
 * e.g. `nav andros "$( click 1 )"'
 */
nav: `{
  run '({ api, args, home }) {
    const npcKey = args[0]
    const position = api.safeJsonParse(args[1])
    const npcs = api.getCached(\`npcs@\${home.WIRE_KEY}\`)
    const result = npcs.getNpcGlobalNav({ npcKey, dst: position })
    if (home.DEBUG === "true") {
      const path = (result?.paths??[]).reduce((agg, item) => agg.concat(item), []);
      npcs.toggleDebugPath({ pathKey: npcKey, path })
    }
    yield result
  }' "$@"
}`,

/**
 * Move an npc along a path via WIRE_KEY.
 * e.g. `walk andros "[$( click 1 ), $( click 1 )]"'
 */
walk: `{
  run '({ api, args, home }) {
    const npcKey = args[0]
    // TODO can read arbitrarily many
    // TODO can pause/resume (may need onSuspends)
    const path = api.safeJsonParse(args[1]) || !api.isTtyAt(0) && await api.read()
    const npcs = api.getCached(\`npcs@\${home.WIRE_KEY}\`)
    await npcs.walkNpc({ npcKey, path })
  }' "$@"
}`,

// Simplification
go: `{
  nav $1 $(click 1) |
    map 'x => x.paths.reduce((agg, item) => agg.concat(item), [])' |
    walk $1
}`,
// Simplification
goLoop: `{
  while true; do
    nav $1 $(click 1) |
      map 'x => x.paths.reduce((agg, item) => agg.concat(item), [])' |
      walk $1
  done
}`,

view: `{
  run '({ api, args }) {
    const opts = Function(\`return \${args[0]} \`)()
    if (!(opts && typeof opts === "object")) {
      api.throwError("format: \`view \\"{ zoom?: {number}, to?: {vec}, ms?: {number} }\`\\"")
    }
    // Returns "cancelled" or "completed"
    await api.reqRes({ key: "view-req", zoom: opts.zoom, to: opts.to, ms: opts.ms })
  }' "$@"
}`,

/** Get NPC */
npc: `{
  run '({ api, args, home }) {
    const npcs = api.getCached(\`npcs@\${home.WIRE_KEY}\`)
    yield npcs.getNpc({ npcKey: args[0] })
  }' "$@"
}`,

/** Ping every second until found */
ready: `{
  run '({ api, home }) {
    const cacheKey = \`npcs@\${home.WIRE_KEY}\`
    yield \`polling for cached query ${ansiBlue}\${cacheKey}${ansiWhite}\`
    while (!api.getCached(cacheKey)) yield* await api.sleep(1)
    yield \`found cached query ${ansiBlue}\${cacheKey}${ansiWhite}\`
  }' "$@"
}`,

/** If UI idle and camera not close, pan to npc */
track: `{
  run '/** track andros */ ({ api, args }) {
    const npcKey = args[0]
    const process = api.getProcess()
    const { Vect } = await api.reqRes({ key: "classes-req" })

    while (true) {
      await api.reqRes({ key: "panzoom-idle-req" })

      const npc = await api.reqRes({ key: "npc-req", npcKey })
      const npcPosition = Vect.from(npc.getPosition())
      const worldFocus = await api.reqRes({ key: "panzoom-focus-req" })

      if (npcPosition.distanceTo(worldFocus) > 10) {
        if (npc.spriteSheet === "walk") {
          await api.reqRes({ key: "view-req", to: npcPosition, ms: 500, fn: "linear", zoom: 1.6 })
        } else {
          await api.reqRes({ key: "view-req", to: npcPosition, ms: 2000, fn: "ease", zoom: 1.6 })
        }
      } else {
        const ms = npc.spriteSheet === "walk" ? 0.01 : 1;
        yield* await api.sleep(ms)
      }
    }
  }' "$@"
}`,

},

];

/** This is `/etc` */
export const scriptLookup = {
  'util-1': Object.entries(utilFunctions[0])
    .map(([funcName, funcBody]) => `${funcName} () ${funcBody.trim()}`
  ).join('\n\n'),

  'game-1': Object.entries(gameFunctions[0])
    .map(([funcName, funcBody]) => `${funcName} () ${funcBody.trim()}`
  ).join('\n\n'),
};
