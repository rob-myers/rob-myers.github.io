import cheerio, { CheerioAPI, Element } from 'cheerio';
import { Image, createCanvas, Canvas } from 'canvas';
import path from 'path';

import { Poly, Vect } from '../geom';
import { extractGeomsAt, extractMetas, hasTitle } from './cheerio';
import { saveCanvasAsFile } from './file';

/**
 * @param {ServerTypes.ParsedNpc} parsed 
 * @param {string} npcOutputDir 
 * @param {number} [zoom] 
 */
export function renderNpcSpriteSheets(parsed, npcOutputDir, zoom = 1) {
  for (const anim of Object.values(parsed.animLookup)) {
    const canvas = drawAnimSpriteSheet(anim, zoom);
    const outputPath = path.resolve(npcOutputDir, `${parsed.npcName}--${anim.animName}.png`);
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
 * @param {number} frame 0-based frame index
 * @param {Canvas} canvas 
 * @param {number} [zoom] 
 */
function drawFrameAt(anim, frame, canvas, zoom = 1) {
  const svgItems = anim.frames[frame].map(item => {
    const style = Object.entries(item.style).map(x => x.join(': ')).join(';');
    const transform = item.transform ? `matrix(${item.transform})` : '';
    if (item.tagName === 'ellipse') {
      return `<ellipse cx="${item.cx}" cy="${item.cy}" rx="${item.rx}" ry="${item.ry}" style="${style}" transform="${transform}" />`;
    } else if (item.tagName === 'path') {
      return `<path d="${item.d}" style="${style}" transform="${transform}" />`;
    } else if (item.tagName === 'rect') {
      return `<rect x="${item.x}" y="${item.y}" width="${item.width}" height="${item.height}" style="${style}" transform="${transform}" />`;
    }
  });

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="${anim.aabb.toString()}" width="${anim.aabb.width * zoom}" height="${anim.aabb.height * zoom}">
      ${svgItems.join('\n    ')}
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
  console.log('found', { animMetas });

  return {
    npcName,
    animLookup: animMetas.reduce((agg, { animName, aabb }) => ({ ...agg,
      [animName]: { animName, aabb, frames: extractNpcFrames($, topNodes, animName) },
    }), /** @type {ServerTypes.ParsedNpc['animLookup']} */ ({})),
    zoom,
  };
}

/**
 * @param {CheerioAPI} api
 * @param {Element[]} topNodes
 * @param {string} title
 */
function extractNpcFrames(api, topNodes, title) {
  /** The group containing groups of frames */
  const animGroup = topNodes.find(x => hasTitle(api, x, title));
  /** The groups inside the group `animGroup` */
  const groups = /** @type {Element[]} */ (animGroup?.children??[]).filter(x => x.name === 'g');

  const output = /** @type {ServerTypes.GeomTagMeta[][]} */ ([]);
  for (const group of groups) output.push(extractMetas(api, group));
  return output;
}

/**
 * TODO 🚧 deps needs rethink
 * @param {string} npcKey 
 * @param {Geom.VectJson} at 
 * @param {{ disabled?: boolean; panZoomApi: PanZoom.CssExtApi; update: () => void }} deps
 */
export function createNpc(npcKey, at, {disabled, panZoomApi, update}) {
  /** @type {NPC.NPC} */
  const npc = {
    key: npcKey,
    uid: `${npcKey}-${++spawnCount}`,
    def: {
      key: npcKey,
      position: at,
      angle: 0, // TODO 🚧 integrate
      paused: !!disabled,
    },
    el: {
      root: /** @type {HTMLDivElement} */ ({}),
      body: /** @type {HTMLDivElement} */ ({}),
    },
    anim: {
      root: new Animation,
      body: new Animation,
    },
    animPath: [],
    aux: {
      angs: [], count: 0, edges: [], elens: [], navPathPolys: [], sofars: [], total: 0,
    },
    origPath: [],
    spriteSheet: 'idle',

    followNavPath() {
      const { aux } = this;
      if (this.animPath.length <= 1 || aux.total === 0) {
        return; // Already finished
      }
      
      const wasPaused = this.anim.root.playState === 'paused';
      this.anim.root = this.el.root.animate(
        // NOTE need ≥ 2 frames for polyfill
        this.animPath.flatMap((p, i) => [
          {
            offset: aux.sofars[i] / aux.total,
            transform: `translate(${p.x}px, ${p.y}px) rotateZ(${aux.angs[i - 1] || aux.angs[i] || 0}rad)`,
          },
          {
            offset: aux.sofars[i] / aux.total,
            transform: `translate(${p.x}px, ${p.y}px) rotateZ(${aux.angs[i] || aux.angs[i - 1] || 0}rad)`,
          },
        ]),
        { duration: aux.total * animScaleFactor, direction: 'normal', fill: 'forwards' },
      );
      
      this.spriteSheet = 'walk';
      this.anim.root.addEventListener('finish', () => { this.spriteSheet = 'idle'; update(); });

      if (wasPaused || (aux.count === 0 && this.def.paused)) {
        this.pause();
      }
      aux.count++;
    },
    getAngle() {
      const matrix = new DOMMatrixReadOnly(window.getComputedStyle(this.el.root).transform);
      return Math.atan2(matrix.m12, matrix.m11);
    },
    getPosition() {
      const { x: clientX, y: clientY } = Vect.from(this.el.root.getBoundingClientRect());
      return Vect.from(panZoomApi.getWorld({ clientX, clientY }));
    },
    pause() {
      if (this.anim.body.playState === 'running') {
        this.anim.body.pause();
      }
    },
    updateAnimAux() {
      const { animPath, aux } = this;
      aux.edges = animPath.map((p, i) => ({ p, q: animPath[i + 1] })).slice(0, -1);
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

let spawnCount = 0;
/** Scale up how long it should take to move along navpath */
const animScaleFactor = 15;
