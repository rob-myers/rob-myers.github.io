import cheerio, { CheerioAPI, Element } from 'cheerio';
import { Image, createCanvas, Canvas } from 'canvas';
import path from 'path';

import { extractGeomsAt, extractMetas, hasTitle } from './cheerio';
import { saveCanvasAsFile } from './file';

const publicDir = path.resolve(__dirname, '../../public');
const outputDir = path.resolve(publicDir, 'npc');

/**
 * @param {ServerTypes.ParsedNpc} parsed 
 */
export function renderNpc(parsed) {
  /**
   * - ✅ test render a frame
   *   > use https://github.com/Automattic/node-canvas/issues/1116
   * - ✅ better render of frame
   * - ✅ can zoom
   * - ✅ can output whole animation as horizontal spritesheet
   * - ✅ output all animations
   * - output jsons with aabb, zoom, numFrames etc.
   */
  const zoom = 2;

  for (const anim of Object.values(parsed.animLookup)) {
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
 * @returns {ServerTypes.ParsedNpc}
 */
 export function parseNpc(npcName, svgContents) {
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
