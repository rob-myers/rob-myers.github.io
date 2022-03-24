import cheerio, { CheerioAPI, Element } from 'cheerio';
import { pretty } from '../../model/generic.model';
import { extractMetas, hasTitle } from './cheerio';

/**
 * @param {string} npcName 
 * @param {string} svgContents 
 */
export function parseNpc(npcName, svgContents) {
  const $ = cheerio.load(svgContents);
  const topNodes = Array.from($('svg > *'));

  /**
   * TODO
   * - render a frame
   */
  const idle = extractFrames($, topNodes, 'idle');
  const walk = extractFrames($, topNodes, 'walk');
  
  console.log(pretty({ 
    idle,
    walk,
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
  const framesGroup = topNodes.find(x => hasTitle(api, x, title));
  const frames = /** @type {ServerTypes.GeomTagMeta[][]} */ ([]);
  for (const frameGroup of framesGroup?.children??[]) {
    const geomMetas = extractMetas(api, /** @type {Element} */ (frameGroup));
    frames.push(geomMetas);
  }
  return frames;
}
