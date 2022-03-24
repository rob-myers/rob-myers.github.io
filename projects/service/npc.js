import cheerio from 'cheerio';

/**
 * @param {string} npcName 
 * @param {string} svgContents 
 */
export function parseNpc(npcName, svgContents) {
  const $ = cheerio.load(svgContents);
  const topNodes = Array.from($('svg > *'));

  console.log({ 
    topNodes,
  })

  return {
    // TODO
  };
}
