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
track andros &

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

export const gameFunctions = [
{
/**
 * Output world position clicks sent via panZoomApi.events.
 * e.g. `click`, `click 1`
 */
click: `{
  run '({ api, args, home }) {
    const numClicks = args[0] === "" ? Number.MAX_SAFE_INTEGER : Number(args[0])
    if (!Number.isFinite(numClicks)) {
      api.throwError("format: \`click [{numberOfClicks}]\`")
    }

    const npcs = api.getCached(home.NPCS_KEY)
    const { filter, map, take, otag } = npcs.rxjs
    const process = api.getProcess()
    
    yield* otag(
      npcs.getPanZoomApi().events.pipe(
        filter(x => x.key === "pointerup" && process.status === 1),
        map(e => ({ x: Number(e.point.x.toFixed(2)), y: Number(e.point.y.toFixed(2)), tags: e.tags })),
        take(numClicks),
      ),
      process,
    )
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
 * Request navpath(s) to position(s) for character(s),
 * - e.g. `nav andros "$( click 1 )"'
 * - e.g. `expr '{"npcKey":"andros","point":{"x":300,"y":300}}' | nav`
 * - e.g. `click | map 'x => ({ npcKey: "andros", point: x })' | nav`
 */
nav: `{
  run '({ api, args, home, datum }) {
    const npcs = api.getCached(home.NPCS_KEY)
    if (api.isTtyAt(0)) {
      const npcKey = args[0]
      const point = api.safeJsonParse(args[1])
      yield npcs.getNpcGlobalNav({ npcKey, point, debug: home.DEBUG === "true" })
    } else {
      while ((datum = await api.read()) !== null) {
        try {
          yield npcs.getNpcGlobalNav({ debug: home.DEBUG === "true", ...datum })
        } catch (e) {
          api.warn(\`\${e}\`)
        }
      }
    }
  }' "$@"
}`,

/**
 * Move an npc along path(s) e.g.
 * - `walk andros "[$( click 1 ), $( click 1 )]"'
 * - `expr "{ points: [$( click 1 ), $( click 1 )] }" | walk andros`
 * - `expr "{ key: 'global-nav', paths: [{ key: 'local-nav', paths: [[$( click 1 ), $( click 1 )]], edges: [] }], edges: [] }" | walk andros`
 * 
 * Technically distinct npcs can be referenced, but since each
 * path is walked one after another, this is less useful.
 * 
 * TODO
 * - handle npc pause/resume
 */
walk: `{
  run '({ api, args, home, datum }) {
    const npcs = api.getCached(home.NPCS_KEY)
    const npcKey = args[0]
    if (api.isTtyAt(0)) {
      const points = api.safeJsonParse(args[1])
      await npcs.walkNpc({ npcKey, points })
    } else {
      // npcKey must be fixed via 1st arg
      while ((datum = await api.read()) !== null)
        await npcs.walkNpc({ npcKey, ...datum })
    }
  }' "$@"
}`,

// TODO remove path collapse
// NOTE ignores doors
go: `{
  nav $1 $(click 1) |
    map 'x => ({
      points: x.paths.reduce((agg, item) => agg.concat(...item.paths), []),
    })' |
    walk $1
}`,
// TODO remove path collapse
// TODO handle click before finish
goLoop: `{
  click |
    filter 'x => x.tags.includes("floor")' |
    map 'x => ({ npcKey: "'$1'", point: x })' |
    nav |
    map 'x => ({
      points: x.paths.reduce((agg, item) => agg.concat(...item.paths), []),
    })' |
    walk $1
}`,

// TODO handle multiple reads?
view: `{
  run '({ api, args, home }) {
    const opts = Function(\`return \${args[0]} \`)()
    const npcs = api.getCached(home.NPCS_KEY)
    npcs.panZoomTo(opts) // Returns "cancelled" or "completed"
  }' "$@"
}`,

/** Get NPC */
npc: `{
  run '({ api, args, home }) {
    const npcs = api.getCached(home.NPCS_KEY)
    yield npcs.getNpc({ npcKey: args[0] })
  }' "$@"
}`,

/** Ping every second until found */
ready: `{
  run '({ api, home }) {
    const cacheKey = home.NPCS_KEY
    yield \`ℹ️  polling for cached query ${ansiBlue}\${cacheKey}${ansiWhite}\`
    while (!api.getCached(cacheKey)) yield* await api.sleep(1)
    yield \`✅  found cached query ${ansiBlue}\${cacheKey}${ansiWhite}\`
  }' "$@"
}`,

/**
 * If UI idle and camera not close, pan to npc
 * TODO
 * - less jerky on mobile
 * - avoid polling
 */
track: `{
  run '/** track npc */ ({ api, args, home }) {
    const npcKey = args[0]
    const npcs = api.getCached(home.NPCS_KEY)
    const panZoomApi = npcs.getPanZoomApi()

    while (true) {
      await npcs.awaitPanZoomIdle()

      // TODO handle ongoing panZoom without polling
      if (panZoomApi.anims[0]) {
        yield* await api.sleep(1)
        continue
      }

      const worldFocus = panZoomApi.getWorldAtCenter()
      const npc = npcs.npc[npcKey]
      const npcPosition = npc.getPosition()
      const distance = npcs.class.Vect.from(npcPosition).distanceTo(worldFocus)

      if (npc.spriteSheet === "walk") {
        const targets = npc.getTargets()
        if (targets.length > 0) {
          // console.log(targets)
          const target = targets[0]
          await npcs.panZoomTo({ zoom: 1.6, point: target.point, ms: 1.1 * target.ms, easing: "linear" })
        } else {
          yield* await api.sleep(1)
        }
      } else if (npc.spriteSheet === "idle") {
        if (distance > 60) {// speed 60 world unit per second
          const ms = (distance / 60) * 1000
          await npcs.panZoomTo({ zoom: 1.6, point: npcPosition, ms })
        } else if (distance > 20) {
          const ms = (distance / 30) * 1000
          await npcs.panZoomTo({ zoom: 1.6, point: npcPosition, ms })
        } else {
          yield* await api.sleep(1)
        }
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
