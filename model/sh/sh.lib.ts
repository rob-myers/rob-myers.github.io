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
# TODO camera follows andros e.g. walks
# track &
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

// TODO move to scripts?
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
    if (
      !npcKey
      || position === undefined
      || position && !(typeof position.x === "number" && typeof position.y === "number")
    ) {
      api.throwError("format: \`spawn {key} [{vec}]\` e.g. spawn andros \'{"x":300,"y":120}\'")
    }

    const at = position || { x: 0, y: 0 }
    api.getWire().next({ key: "spawn", npcKey, at })
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
    if (
      !npcKey
      || position === undefined
      || position && !(typeof position.x === "number" && typeof position.y === "number")
    ) {
      api.throwError("format: \`nav {npc-key} [{vec}]\` e.g. nav andros \'{"x":300,"y":120}\'")
    }

    const res = await api.reqRes({ key: "nav-req", npcKey, dst: position })

    if (home.DEBUG === "true") {
      const path = (res?.paths??[]).reduce((agg, item) => agg.concat(item), []);
      api.getWire().next({ key: "debug-path", pathName: "debug-" + npcKey, path })
    }

    yield res
  }' "$@"
}`,

/**
 * Move an npc along a path via WIRE_KEY.
 * e.g. `walk andros "[$( click 1 ), $( click 1 )]"'
 */
walk: `{
  run '({ api, args }) {
    const npcKey = args[0]
    const path = api.safeJsonParse(args[1]) || !api.isTtyAt(0) && await api.read()
    if (
      !npcKey
      || !Array.isArray(path)
      || !path.every(p => p && typeof p.x === "number" && typeof p.y === "number")
    ) {
      api.throwError("format: \`walk {npc-key} [{vec},...,{vec}]\`")
    }

    const anim = await api.reqRes({ key: "walk-req", npcKey, path })
    
    // Wait until walk finished or cancelled
    await new Promise((resolve, reject) => {
      anim.addEventListener("finish", resolve)
      anim.addEventListener("cancel", reject)
    })
  }' "$@"
}`,

// TODO currently a simplification
go: `{
  nav $1 $(click 1) |
    map 'x => x.paths.reduce((agg, item) => agg.concat(item), [])' |
    walk $1
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
  run '({ api, args }) {
    const npcKey = args[0]
    yield await api.reqRes({ key: "npc-req", npcKey })
  }' "$@"
}`,

/** Ping every second until pong */
ready: `{
  run '({ api, home }) {
    yield \`ℹ️ awaiting ${ansiBlue}"pong"${ansiWhite} on ${ansiBlue}"\${home.WIRE_KEY}"${ansiWhite}  \`

    const ping = () => api.getWire().next({ key: "ping" })
    const intervalId = window.setInterval(ping, 1000)
    window.setTimeout(ping)
    api.getProcess().cleanups.push(() => window.clearInterval(intervalId))

    for await (_ of api.mapWire(e => e.key === "pong" ? 1 : undefined)) {
      yield \`✅ received ${ansiBlue}"pong"${ansiWhite} on ${ansiBlue}"\${home.WIRE_KEY}"${ansiWhite}  \`
      break; // Stop on 1st message
    }
  }' "$@"
}`,

/** If CssPanZoom UI idle and camera far from npc, pan to npc */
track: `{
  run '/** track andros */ ({ api }) {
    const process = api.getProcess()
    const { Vect } = await api.reqRes({ key: "classes-req" })

    // TODO support pausing
    // - ✅ during api.sleep
    // - 🚧 during api.reqRes

    while (process.status !== 2) {// ProcessStatus.Killed === 2
      await api.reqRes({ key: "panzoom-idle-req" })

      const npc = await api.reqRes({ key: "npc-req", npcKey: "andros" })
      const npcPosition = Vect.from(npc.getPosition())
      const worldFocus = await api.reqRes({ key: "panzoom-focus-req" })

      if (npcPosition.distanceTo(worldFocus) > 10) {
        await api.reqRes({ key: "view-req", to: npcPosition, ms: 1000 })
      } else {// TODO event on npc move?
        yield* await api.sleep(1)
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
