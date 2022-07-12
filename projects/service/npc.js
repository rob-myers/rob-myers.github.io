import cheerio, { CheerioAPI, Element } from 'cheerio';
import { Image, createCanvas, Canvas } from 'canvas';
import path from 'path';

import { Vect } from '../geom';
import { extractGeom, extractGeomsAt, hasTitle, matchesTitle } from './cheerio';
import { saveCanvasAsFile } from './file';
import { warn } from './log';

/**
 * @param {ServerTypes.ParsedNpcCheerio} parsed 
 * @param {string} outputDir 
 * @param {{ zoom: number; animNames: string[] }} opts
 */
export async function renderNpcSpriteSheets(parsed, outputDir, opts) {
  const { animNames, zoom } = opts;

  const anims = animNames.length
    ? Object.values(parsed.animLookup).filter(x => animNames.includes(x.animName))
    : Object.values(parsed.animLookup);

  for (const anim of anims) {
    const canvas = await drawAnimSpriteSheet(anim, zoom);
    const outputPath = path.resolve(outputDir, `${parsed.npcName}--${anim.animName}.png`);
    saveCanvasAsFile(canvas, outputPath);
  }
}

/**
 * @param {ServerTypes.NpcAnimCheerio} anim 
 * @param {number} zoom
 */
async function drawAnimSpriteSheet(anim, zoom) {
  const frameCount = anim.frameCount;
  const canvas = createCanvas(anim.aabb.width * frameCount, anim.aabb.height);
  const ctxt = canvas.getContext('2d');

  for (let i = 0; i < frameCount; i++) {
    await drawFrame(anim, i, canvas, zoom);
    // Spritesheet rendered from left to right
    ctxt.translate(anim.aabb.width, 0);
  }

  ctxt.restore();
  return canvas;
}

/**
 * - Render by recreating an SVG and assigning as Image src.
 * - Permits complex SVG <path>s, non-trivial to draw directly into canvas.
 * - Need <def> e.g. for head symbol.
 * @param {ServerTypes.NpcAnimCheerio} anim 
 * @param {number} frameId 0-based frame index
 * @param {Canvas} canvas 
 * @param {number} zoom
 */
async function drawFrame(anim, frameId, canvas, zoom) {
  const group = anim.frameNodes[frameId];

  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      xmlns:bx="https://boxy-svg.com"
      viewBox="${
        // We zoom the SVG here
        anim.aabb.clone().scale(1/zoom).toString()
      }"
      width="${anim.aabb.width}"
      height="${anim.aabb.height}"
    >
      ${anim.defsNode ? cheerio.html(anim.defsNode) : ''}
      ${cheerio.html(group)}
    </svg>
  `;
  // console.log(svg)

  const image = new Image;
  await new Promise(resolve => {
    image.onload = () => /** @type {*} */ (resolve)();
    image.src = Buffer.from(svg, 'utf-8');
  });

  canvas.getContext('2d').drawImage(image, 0, 0);
}

/**
 * @param {string} npcName 
 * @param {string} svgContents
 * @param {number} [zoom] 
 * @returns {ServerTypes.ParsedNpcCheerio}
 */
export function parseNpc(npcName, svgContents, zoom = 1) {
  const $ = cheerio.load(svgContents);
  const topNodes = Array.from($('svg > *'));

  const metaGeoms = extractGeomsAt($, topNodes, 'meta');
  const boundsGeoms = metaGeoms.filter(x => x._ownTags[1] === 'bounds');
  const animMetas = boundsGeoms.map(x => ({ animName: x._ownTags[0], aabb: x.rect.scale(zoom) }));
  const symbolLookup = extractDefSymbols($, topNodes);
  console.log('parseNpc found:', { animMetas, symbolLookup });

  // Remove <image>s with visibility hidden (probably used for tracing)
  // They slow the rendering process
  Array.from($('image'))
    .filter(x => (x.attribs.style || '').includes('visibility: hidden;'))
    .forEach(x => $(x).remove());
  
  // Hide any rectangle with tag meta e.g. contact points in frames
  Array.from($('rect'))
    .filter(x => matchesTitle($, x, /(?:^| )meta(?:$| )/))
    .forEach(x => x.attribs.style = (x.attribs.style || '') + 'visibility: hidden;')

  return {
    npcName,
    animLookup: animMetas
      .reduce((agg, { animName, aabb }) => {
        const defsNode = topNodes.find(x => x.type === 'tag' && x.name === 'defs') || null;
        const frameNodes = extractNpcFrameNodes($, topNodes, animName);

        /** @type {ServerTypes.NpcAnimMeta['contacts']} */
        const contacts = frameNodes.map((group, frameId) => {
          const polys = $(group).find('rect').toArray()
            .flatMap(x => extractGeom($, x)).filter(x => ['meta', 'contact']
            .every(tag => x._ownTags.includes(tag)));
          const left = polys.find(x => x._ownTags.includes('left'));
          const right = polys.find(x => x._ownTags.includes('right'));
          return {
            left: left ? left.center.scale(zoom).json : undefined,
            right: right ? right.center.scale(zoom).json : undefined,
          };
        });

        /** One more than frame count i.e. distances travelled from last -> first */
        const deltas = contacts.concat(contacts[0]).map(({ left: leftFoot, right: rightFoot }, i) => {
          const [prevLeft, prevRight] = [contacts[i - 1]?.left, contacts[i - 1]?.right];
          return (// For walk, exactly one of 1st two summands should be non-zero
            (!leftFoot || !prevLeft ? 0 : Math.abs(leftFoot.x - prevLeft.x)) ||
            (!rightFoot || !prevRight ? 0 : Math.abs(rightFoot.x - prevRight.x)) || 0
          );
        });

        agg[animName] = {
          animName,
          aabb,
          frameCount: frameNodes.length,
          defsNode,
          frameNodes,
          contacts,
          deltas,
          totalDist: deltas.reduce((sum, x) => sum + x, 0),
        };
        return agg;
      }, /** @type {ServerTypes.ParsedNpcCheerio['animLookup']} */ ({})),
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
 */
function extractNpcFrameNodes(api, topNodes, title) {
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
    .filter(x => x.name === 'g')
  
  // Override visibility: hidden
  groups.forEach(group => {
    group.attribs.style = (group.attribs.style || '')
      + 'visibility: visible;'
  });
  return groups;
}

/** @param {NPC.LocalNavPath} input */
export function verifyLocalNavPath(input) {
  let x = /** @type {Partial<NPC.LocalNavPath>} */ (input);
  return x?.key === 'local-nav'
    && x.fullPath?.every?.(Vect.isVectJson)
    // TODO check navMetas
    || false;
}

/** @param {NPC.GlobalNavPath} input */
export function verifyGlobalNavPath(input) {
  let x = /** @type {Partial<NPC.GlobalNavPath>} */ (input);
  return x?.key === 'global-nav'
    && x.fullPath?.every?.(Vect.isVectJson)
    && Array.isArray(x.navMetas)
    // TODO check navMetas
    || false;
}

/** @param {NPC.DecorDef} input */
export function verifyDecor(input) {
  if (input && input.type === 'path' && input?.path?.every(/** @param {*} x */ (x) => Vect.isVectJson(x))) {
    return true;
  } else if (input && input.type === 'circle' && Vect.isVectJson(input.center) && typeof input.radius === 'number') {
    return true;
  }
  return false;
}
