import cheerio, { CheerioAPI, Element } from 'cheerio';
import { Image, createCanvas, Canvas } from 'canvas';
import path from 'path';
import util from 'util';
import stream from 'stream';
import fs from 'fs';

import { extractGeomsAt, extractMetas, hasTitle } from './cheerio';

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
   * - output a whole animation
   * - output all animations
   */
   const anim = parsed.animLookup.idle;
   const canvas = createCanvas(anim.aabb.width, anim.aabb.height);
   drawFrame(anim, 0, canvas)
 
   const outputPath = path.resolve(outputDir, 'test.png');
   util.promisify(stream.pipeline)(
     canvas.createPNGStream(), 
     fs.createWriteStream(outputPath),
   );

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
  const metaBoundsGeoms = metaGeoms.filter(x => x._ownTags[1] === 'bounds');
  const animHeads = metaBoundsGeoms.map(x => ({ animName: x._ownTags[0], aabb: x.rect }));
  console.log('found', { animHeads });

  return {
    npcName,
    animLookup: animHeads.reduce((agg, { animName, aabb }) => ({ ...agg,
      [animName]: { aabb, frames: extractFrames($, topNodes, animName) },
    }), {}),
  };
}

/**
 * 
 * @param {ServerTypes.NpcAnim} anim 
 * @param {number} frame
 * @param {Canvas} canvas 
 */
function drawFrame(anim, frame, canvas) {
  const svgItems = anim.frames[frame].map(item => {
    const style = Object.entries(item.style).map(x => x.join(': ')).join(';');
    if (item.tagName === 'ellipse') {
      // TODO styles
      return `<ellipse style="${style}" cx="${item.cx}" cy="${item.cy}" rx="${item.rx}" ry="${item.ry}" />`;
    } else if (item.tagName === 'path') {
      // TODO
      return `<path style="${style}" d="${item.d}" />`;
    } else if (item.tagName === 'rect') {
      // TODO
      return `<rect style="${style}" x="${item.x}" y="${item.y}" width="${item.width}" height="${item.height}" />`;
    }
  });
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="${anim.aabb.toString()}" width="${anim.aabb.width}" height="${anim.aabb.height}">
      ${svgItems.join('\n    ')}
    </svg>
  `;
  const image = new Image;
  image.src = Buffer.from(svg, 'utf-8');
  canvas.getContext('2d').drawImage(image, 0, 0);
}

/**
 * @param {CheerioAPI} api
 * @param {Element[]} topNodes
 * @param {string} title
 */
function extractFrames(api, topNodes, title) {
  /** The group containing groups of frames */
  const animGroup = topNodes.find(x => hasTitle(api, x, title));
  /** The groups inside the group `animGroup` */
  const groups = /** @type {Element[]} */ (animGroup?.children??[]).filter(x => x.name === 'g');

  const output = /** @type {ServerTypes.GeomTagMeta[][]} */ ([]);
  for (const group of groups) output.push(extractMetas(api, group));
  return output;
}
