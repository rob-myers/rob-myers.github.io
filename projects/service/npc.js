import cheerio, { CheerioAPI, Element } from 'cheerio';
import { createCanvas, loadImage } from 'canvas';

import { pretty } from '../../model/generic.model';
import { extractGeomsAt, extractMetas, hasTitle } from './cheerio';
import { Rect } from 'projects/geom';


/**
 * @param {string} npcName 
 * @param {string} svgContents 
 */
export function parseNpc(npcName, svgContents) {
  const $ = cheerio.load(svgContents);
  const topNodes = Array.from($('svg > *'));

  const metaGeoms = extractGeomsAt($, topNodes, 'meta');
  const animNames = metaGeoms.filter(x => x._ownTags[1] === 'bounds').map(x => x._ownTags[0]);
  console.log('found', { animNames });

  const toFrames = /** @type {{ [animName: string]: ServerTypes.GeomTagMeta[][] }} */ ({});
  for (const animName of animNames) {
    const frames = extractFrames($, topNodes, animName);
    toFrames[animName] = frames;
  }

  /**
   * TODO test render a frame
   */
  const frame = toFrames.idle[0];

  console.log(pretty({ 
    toFrames,
  }));

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
  for (const group of groups) {
    const geomMetas = extractMetas(api, group);
    output.push(geomMetas);
  }
  return output;
}
