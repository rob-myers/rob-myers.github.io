/**
 * This file is loaded via webpack `raw-loader` to avoid function transpilation.
 * 
 * - `utilFunctions` is provided by the context
 * - We'll extend it using @see utilFunctionsRunDefs
 * - They are both arrays in order to support future versions of the named functions.
 * 
 * - `gameFunctions` is provided by the context
 * - We'll extend it using @see gameFunctionsDefs
 */


//#region defs

/**
 * @typedef RunArg @type {object}
 * @property {import('./cmd.service').CmdServiceType['processApi']} api
 * @property {string[]} args
 * @property {Record<string, any>} home
 * @property {*} [datum] A shortcut for declaring a variable
 */

/**
 * Definitions of util shell functions based on builtin `run`.
 * 
 * A key-value in this lookup e.g.
 * > `['foo', function*({ args }) { 42; }]`
 * 
 * will eventually become e.g.
 * > ``['foo', `run '({ args }) { 42; }' "$@"`]``.
 * @type {Record<string, (arg: RunArg) => void>[]}
 */
const utilFunctionsRunDefs = [
{

  /** Evaluate and return a javascript expression */
  expr: function* ({ api, args }) {
    const input = args.join(" ")
    yield api.parseJsArg(input)
  },

  /** Filter inputs */
  filter: async function* (ctxt) {
    let { api, args, datum } = ctxt
    const func = Function(`return ${args[0]}`)()
    while ((datum = await api.read()) !== null)
      if (func(datum, ctxt)) yield datum
  },

  /** Execute a javascript function */
  call: async function* (ctxt) {
    const func = Function(`return ${ctxt.args[0]}`)()
    ctxt.args = ctxt.args.slice(1)
    yield await func(ctxt)
  },

  /** Apply function to each item from stdin */
  map: async function* (ctxt) {
    let { api, args, datum } = ctxt
    const func = Function(`return ${args[0]}`)()
    while ((datum = await api.read(true)) !== null) {
      if (datum.__chunk__) yield { ...datum, items: /** @type {any[]} */ (datum.items).map(x => func(x, ctxt)) }
      else yield func(datum, ctxt)
    }
  },

  poll: async function* ({ api, args }) {
    yield* api.poll(args)
  },

  /** Reduce all items from stdin */
  reduce: async function* ({ api, args, datum }) {
    const inputs = []
    const reducer = Function(`return ${args[0]}`)()
    while ((datum = await api.read()) !== null)
      inputs.push(datum)
    yield args[1]
      ? inputs.reduce(reducer, api.parseJsArg(args[1]))
      : inputs.reduce(reducer)
  },

  /**
   * Split arrays from stdin into items.
   * Split strings by optional separator (default `''`).
   * Otherwise ignore.
   */
  split: async function* ({ api, args, datum }) {
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
  },

  /** Collect stdin into a single array */
  sponge: async function* ({ api, datum }) {
    const outputs = []
    while ((datum = await api.read()) !== null)
      outputs.push(datum)
    yield outputs
  },

},
];

/**
 * Definitions of game shell function based on builtin `run`.
 *
 * @type {Record<string, (arg: RunArg) => void>[]}
 */
const gameFunctionsRunDefs = [
{

  /**
   * Output world position clicks sent via panZoomApi.events.
   * e.g. `click`, `click 1`
   */
  click: async function* ({ api, args, home }) {
    const numClicks = args[0] === "" ? Number.MAX_SAFE_INTEGER : Number(args[0])
    if (!Number.isFinite(numClicks)) {
      api.throwError("format: \`click [{numberOfClicks}]\`")
    }
    /** @type {NPC.FullApi} */
    const npcs = api.getCached(home.NPCS_KEY)
    const { filter, map, take, otag } = npcs.rxjs
    const process = api.getProcess()
    
    yield* otag(
      npcs.getPanZoomApi().events.pipe(
        filter(
          /** @type function(*): x is Extract<PanZoom.CssInternalEvent, { key: "pointerup" }> */
          x => x.key === "pointerup" && x.distance < 5 && process.status === 1
        ),
        take(numClicks),
        map(e => ({
          x: Number(e.point.x.toFixed(2)),
          y: Number(e.point.y.toFixed(2)),
          tags: [...e.tags, ...npcs.getPointTags(e.point)],
        })),
      ),
      (deferred, subscription) => (
        process.cleanups.push(
          () => deferred.promise.reject(api.getKillError()),
          () => subscription.unsubscribe(),
        )
      ),
    )
  },

  look: async function* ({ api, args, datum, home }) {
    const npcs = api.getCached(home.NPCS_KEY)
    const npcKey = args[0]
    if (api.isTtyAt(0)) {
      const point = api.safeJsonParse(args[1])
      await npcs.npcAct({ action: "look-at", npcKey, point })
    } else {
      while ((datum = await api.read()) !== null) {
        await npcs.npcAct({ action: "look-at", npcKey, point: datum })
      }
    }
  },

  /**
   * Request navpath(s) to position(s) for character(s),
   * - e.g. `nav andros "$( click 1 )"'
   * - e.g. `expr '{"npcKey":"andros","point":{"x":300,"y":300}}' | nav`
   * - e.g. `click | map 'x => ({ npcKey: "andros", point: x })' | nav`
   */
  nav: async function* ({ api, args, home, datum }) {
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
          api.warn(`${e}`)
          console.error(e)
        }
      }
    }
  },
},
];

//#endregion

/**
 * Convert functions into shell function bodies
 */
utilFunctionsRunDefs.forEach((defs, i) =>
  Object.entries(defs).forEach(
    //@ts-ignore
    ([key, fn]) => (utilFunctions[i] = utilFunctions[i] || [])[key] = wrap(fn),
  )
);
gameFunctionsRunDefs.forEach((defs, i) =>
  Object.entries(defs).forEach(
    //@ts-ignore
    ([key, fn]) => (gameFunctions[i] = gameFunctions[i] || [])[key] = wrap(fn),
  )
);

/** @param {(arg: { api: any; args: string[]; }) => any} fn */
function wrap(fn) {
  return `{
    run '${fnToSuffix(fn)}' "$@"
  }`
}

/**
 * We assume the input is an anonymous function.
 * @param {(arg: { api: any; args: string[]; }) => any} fn
 */
function fnToSuffix(fn) {
  switch (fn.constructor.name) {
    case 'GeneratorFunction':
      return `${fn}`.slice('function* '.length)
    case 'AsyncGeneratorFunction':
      return `${fn}`.slice('async function* '.length)
    default:
      return `${fn}`.slice('function '.length);
  }
}
