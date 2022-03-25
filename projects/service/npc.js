import cheerio, { CheerioAPI, Element } from 'cheerio';
import { Image, createCanvas } from 'canvas';
import path from 'path';
import util from 'util';
import stream from 'stream';
import fs from 'fs';

import { extractGeomsAt, extractMetas, hasTitle } from './cheerio';

/**
 * @param {string} npcName 
 * @param {string} svgContents 
 */
export function parseNpc(npcName, svgContents) {
  const $ = cheerio.load(svgContents);
  const topNodes = Array.from($('svg > *'));

  const metaGeoms = extractGeomsAt($, topNodes, 'meta');
  const metaBoundsGeoms = metaGeoms.filter(x => x._ownTags[1] === 'bounds');
  const animHeads = metaBoundsGeoms.map(x => ({ animName: x._ownTags[0], aabb: x.rect }));
  console.log('found', { animHeads });

  const toAnim = animHeads.reduce((agg, { animName, aabb }) => ({ ...agg,
    [animName]: { aabb, frames: extractFrames($, topNodes, animName) },
  }), /** @type {{ [animName: string]: ServerTypes.NpcAnim }} */ ({}));  

  /**
   * TODO test render a frame
   * - use https://github.com/Automattic/node-canvas/issues/1116
   */
  const anim = toAnim.idle;
  const frame = anim.frames[0];
  const svgItems = frame.map(item => {
    if (item.tagName === 'ellipse') {
      // TODO
      return `<ellipse cx="${item.cx}" cy="${item.cy}" rx="${item.rx}" ry="${item.ry}" />`;
    } else if (item.tagName === 'path') {
      // TODO
      return `<path stroke="red" d="${item.d}" />`;
    } else if (item.tagName === 'rect') {
      // TODO
      return `<rect fill="blue" x="${item.x}" y="${item.y}" width="${item.width}" height="${item.height}" />`;
    }
  });
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${anim.aabb.width}" height="${anim.aabb.height}">
      ${svgItems.join('\n    ')}
    </svg>
  `;
  const image = new Image;
  image.src = Buffer.from(svg, 'utf-8');

  const canvas = createCanvas(anim.aabb.width, anim.aabb.height);
  const ctxt = canvas.getContext('2d');
  ctxt.drawImage(image, 0, 0);
  const publicDir = path.resolve(__dirname, '../../public');
  const outputDir = path.resolve(publicDir, 'npc');
  const outputPath = path.resolve(outputDir, 'test.png');
  util.promisify(stream.pipeline)(
    canvas.createPNGStream(), 
    fs.createWriteStream(outputPath),
  );

  console.log({ 
    frame,
    svg,
  });

  return {
    // TODO
  };
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
