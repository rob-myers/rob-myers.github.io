import cheerio, { CheerioAPI, Element } from 'cheerio';
import { Image, createCanvas, Canvas } from 'canvas';
import path from 'path';

import { Poly, Vect } from '../geom';
import { extractDeepMetas, extractGeomsAt, hasTitle } from './cheerio';
import { saveCanvasAsFile } from './file';
import { warn } from './log';

/**
 * @param {ServerTypes.ParsedNpc} parsed 
 * @param {string} outputDir 
 * @param {{ zoom?: number; animNames?: string[] }} [opts]
 */
export function renderNpcSpriteSheets(parsed, outputDir, opts = {}) {
  const {
    zoom = 1,
    animNames = Object.keys(parsed.animLookup),
  } = opts;

  const anims = Object.values(parsed.animLookup).filter(x => animNames.includes(x.animName));

  for (const anim of anims) {
    const canvas = drawAnimSpriteSheet(anim, zoom);
    const outputPath = path.resolve(outputDir, `${parsed.npcName}--${anim.animName}.png`);
    saveCanvasAsFile(canvas, outputPath);
  }
}

/**
 * @param {ServerTypes.NpcAnim} anim 
 * @param {number} [zoom] 
 */
function drawAnimSpriteSheet(anim, zoom = 1) {
  const frameCount = anim.frames.length;
  const canvas = createCanvas(anim.aabb.width * zoom * frameCount, anim.aabb.height * zoom);

  const ctxt = canvas.getContext('2d');
  for (let i = 0; i < frameCount; i++) {
    drawFrameAt(anim, i, canvas, zoom);
    ctxt.translate(anim.aabb.width * zoom, 0);
  }
  ctxt.restore();
  return canvas;
}

/**
 * Render by recreating an SVG and assigning as Image src.
 * Permits complex SVG <path>s, non-trivial to draw directly into canvas.
 * @param {ServerTypes.NpcAnim} anim 
 * @param {number} frameId 0-based frame index
 * @param {Canvas} canvas 
 * @param {number} [zoom] 
 */
function drawFrameAt(anim, frameId, canvas, zoom = 1) {
  const frame = anim.frames[frameId];

  const svgItems = frame.geoms.map(item => {
    const style = Object.entries(item.style).map(x => x.join(': ')).join(';');
    const transform = item.transform ? `matrix(${item.transform})` : '';
    if (item.tagName === 'ellipse') {
      return `<ellipse cx="${item.cx}" cy="${item.cy}" rx="${item.rx}" ry="${item.ry}" style="${style}" transform="${transform}" />`;
    } else if (item.tagName === 'path') {
      return `<path d="${item.d}" style="${style}" transform="${transform}" />`;
      // return `<path data-tags="${item.tags}" d="${item.d}" style="${style}" transform="${transform}" />`;
    } else if (item.tagName === 'rect') {
      return `<rect x="${item.x}" y="${item.y}" width="${item.width}" height="${item.height}" style="${style}" transform="${transform}" />`;
    }
  });

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="${anim.aabb.toString()}" width="${anim.aabb.width * zoom}" height="${anim.aabb.height * zoom}">
      <g transform="matrix(${frame.transform})">
        ${svgItems.join('\n' + ' '.repeat(6))}
      </g>
    </svg>
  `;

  const image = new Image;
  image.src = Buffer.from(svg, 'utf-8');
  canvas.getContext('2d').drawImage(image, 0, 0);
}

/**
 * @param {string} npcName 
 * @param {string} svgContents
 * @param {number} [zoom] 
 * @returns {ServerTypes.ParsedNpc}
 */
export function parseNpc(npcName, svgContents, zoom = 1) {
  const $ = cheerio.load(svgContents);
  const topNodes = Array.from($('svg > *'));

  const metaGeoms = extractGeomsAt($, topNodes, 'meta');
  const boundsGeoms = metaGeoms.filter(x => x._ownTags[1] === 'bounds');
  const animMetas = boundsGeoms.map(x => ({ animName: x._ownTags[0], aabb: x.rect }));
  const symbolLookup = extractDefSymbols($, topNodes);
  console.log('parseNpc found:', { animMetas, symbolLookup });

  return {
    npcName,
    animLookup: animMetas
      .reduce((agg, { animName, aabb,  }) => ({ ...agg,
        [animName]: {
          animName,
          aabb,
          frames: extractNpcFrames($, topNodes, animName, symbolLookup),
        },
      }), /** @type {ServerTypes.ParsedNpc['animLookup']} */ ({})),
    zoom,
  };
}

/**
 * @param {CheerioAPI} api
 * @param {Element[]} topNodes
 */
function extractDefSymbols(api, topNodes) {
  const svgDefs = topNodes.find(x => x.type === 'tag' && x.name === 'defs');
  const svgSymbols = api(svgDefs).children('symbol').toArray();
  
  const lookup = svgSymbols.reduce((agg, el) => {
    const id = el.attribs.id;
    const title = api(el).children('title').text() || null;
    if (id !== title) {
      warn(`saw symbol with id "${id}" and distinct title "${title}"`);
    }
    // NOTE symbol must have top-level group(s)
    agg[id] = api(el).children('g').toArray();
    return agg;
  }, /** @type {Record<string, Element[]>} */ ({}));

  return lookup;
}

/**
 * @param {CheerioAPI} api Cheerio
 * @param {Element[]} topNodes Topmost children of <svg>
 * @param {string} title Title of <g> to extract
 * @param {Record<string, Element[]>} symbolLookup
 * @returns {ServerTypes.NpcAnimFrame[]}
 */
function extractNpcFrames(api, topNodes, title, symbolLookup) {
  /**
   * The group named `title` (e.g. `"walk"`), itself containing
   * groups of frames named e.g. `"npc-1"`, `"npc-2"`, etc.
   */
  const animGroup = topNodes.find(x => hasTitle(api, x, title));
  /**
   * The groups inside the group named `animGroup`.
   * The 1st one might be named `"npc-1"`.
   */
  const groups = /** @type {Element[]} */ (animGroup?.children??[])
    .filter(x => x.name === 'g');

  return groups.map((group) =>
    extractDeepMetas(api, symbolLookup, group)
  );
}

/**
 * @param {string} npcKey 
 * @param {Geom.VectJson} at 
 * @param {{ disabled?: boolean; panZoomApi: PanZoom.CssApi; updateNpc: () => void }} deps
 */
export function createNpc(npcKey, at, {disabled, panZoomApi, updateNpc}) {
  /** @type {NPC.NPC} */
  const npc = {
    key: npcKey,
    spawnedAt: Date.now(),
    // TODO hook up angle
    def: { key: npcKey, position: at, angle: 0, paused: !!disabled },
    el: {
      root: /** @type {HTMLDivElement} */ ({}),
      body: /** @type {HTMLDivElement} */ ({}),
    },
    anim: {
      animPath: [],
      aux: { angs: [], count: 0, edges: [], elens: [], navPathPolys: [], sofars: [], total: 0 },
      enteredSheetAt: Date.now(),
      origPath: [],
      spriteSheet: 'idle',

      root: new Animation,
      body: new Animation,

      finishedWalk: true,
    },

    async cancel() {
      const { anim } = this;
      console.log('CANCELLING')
      anim.root.commitStyles();
      await /** @type {Promise<void>} */ (new Promise(resolve => {
        anim.root.addEventListener('cancel', () => resolve());
        anim.root.cancel();
      }));
    },
    async pause() {
      const { anim } = this;
      if (anim.spriteSheet === 'walk') {
        // TODO promise
        anim.root.pause();
        anim.root.commitStyles();
      }
    },
    async resume() {
      const { anim } = this;
      // TODO promise
      anim.root.play();
    },

    async followNavPath() {
      const { anim } = this;
      if (anim.animPath.length <= 1 || anim.aux.total === 0) {
        return; // Already finished
      }
      
      const { keyframes, opts } = this.getAnimDef();
      this.anim.root = this.el.root.animate(keyframes, opts);
      
      // const wasPaused = this.anim.root.playState === 'paused';
      // if (wasPaused || (anim.aux.count === 0 && this.def.paused)) {
      //   this.pause();
      // }
      anim.aux.count++;

      await /** @type {Promise<void>} */ (new Promise((resolve, reject) => {
        console.log('START')
        anim.spriteSheet = 'walk';
        anim.enteredSheetAt = Date.now();
        updateNpc();
        anim.finishedWalk = false;

        // TODO npc.onFinish, npc.onCancel
        anim.root.addEventListener("finish", () => {
          anim.finishedWalk = true;
          anim.root.commitStyles();
          anim.root.cancel();
        });
        anim.root.addEventListener("cancel", () => {
          anim.spriteSheet = 'idle';
          anim.enteredSheetAt = Date.now();
          updateNpc();
          if (anim.finishedWalk) {
            resolve()
            console.log('FINISHED');
          } else {
            reject(new Error('cancelled'));
            console.log('CANCELLED');
          }
        });
      }));
    },
    getAngle() {
      const matrix = new DOMMatrixReadOnly(window.getComputedStyle(this.el.root).transform);
      return Math.atan2(matrix.m12, matrix.m11);
    },
    getAnimDef() {
      // NOTE Web Animations polyfill may require ≥ 2 frames
      const { anim } = this, { aux } = anim;
      return {
        keyframes: anim.animPath.flatMap((p, i) => [
          {
            offset: aux.sofars[i] / aux.total,
            transform: `translate(${p.x}px, ${p.y}px) rotateZ(${aux.angs[i - 1] || aux.angs[i] || 0}rad)`
          },
          {
            offset: aux.sofars[i] / aux.total,
            transform: `translate(${p.x}px, ${p.y}px) rotateZ(${aux.angs[i] || aux.angs[i - 1] || 0}rad)`
          },
        ]),
        opts: { duration: aux.total * animScaleFactor, direction: 'normal', fill: 'forwards' },
      };
    },
    getPosition() {
      const { x: clientX, y: clientY } = Vect.from(this.el.root.getBoundingClientRect());
      return Vect.from(panZoomApi.getWorld({ clientX, clientY })).precision(2);
    },
    getTargets() {
      const { anim } = this;
      if (anim.spriteSheet === "idle") {
        return [];
      }

      const soFarMs = Date.now() - anim.enteredSheetAt;
      const unseenIndex = anim.aux.sofars.findIndex(sofar => sofar * animScaleFactor >= soFarMs + 200);

      if (
        unseenIndex === -1
        || unseenIndex === anim.aux.sofars.length - 1
      ) {
        return [{ point: anim.animPath[anim.animPath.length - 1], ms: anim.aux.total * animScaleFactor - soFarMs }];
      } else {
        return anim.aux.sofars.slice(unseenIndex)
          .map((sofar, i) => ({ point: anim.animPath[unseenIndex + i], ms: (sofar * animScaleFactor) - soFarMs }))
      }
    },
    updateAnimAux() {
      const { anim } = this, {  aux } = anim;
      aux.edges = anim.animPath.map((p, i) => ({ p, q: anim.animPath[i + 1] })).slice(0, -1);
      aux.angs = aux.edges.map(e => Number(Math.atan2(e.q.y - e.p.y, e.q.x - e.p.x).toFixed(2)));
      aux.elens = aux.edges.map(({ p, q }) => Number(p.distanceTo(q).toFixed(2)));
      aux.navPathPolys = aux.edges.map(e => {
        const normal = e.q.clone().sub(e.p).rotate(Math.PI/2).normalize(0.01);
        return new Poly([e.p.clone().add(normal), e.q.clone().add(normal), e.q.clone().sub(normal), e.p.clone().sub(normal)]);
      });
      const reduced = aux.elens.reduce((agg, length) => {
        agg.total += length;
        agg.sofars.push(agg.sofars[agg.sofars.length - 1] + length);
        return agg;
      }, { sofars: [0], total: 0 });
      [aux.sofars, aux.total] = [reduced.sofars, reduced.total];
    },
  };
  return npc;
}

/** Scale up how long it should take to move along navpath */
const animScaleFactor = 15;

/** @param {any} input */
export function isLocalNavPath(input) {
  let x = /** @type {Partial<NPC.LocalNavPath>} */ (input);
  return x?.key === 'local-nav'
    && x.paths?.every?.(path => path?.every?.(Vect.isVectJson))
    && x.edges?.every?.(edge => edge) // Could check props here too
    || false;
}

/** @param {any} input */
export function isGlobalNavPath(input) {
  let x = /** @type {Partial<NPC.GlobalNavPath>} */ (input);
  return x?.key === 'global-nav'
    && x.paths?.every?.(isLocalNavPath)
    && x.edges?.every?.(edge => edge) // Could check props here too
    || false;
}
