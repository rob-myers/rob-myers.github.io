/**
 * Extract metadata from SVGs
 * yarn svg-meta
 */
import fs from 'fs';
import cheerio from 'cheerio'

const src = 'public/svg/hull--301.svg';
const svgContents = fs.readFileSync(src).toString();

const $ = cheerio.load(svgContents);
/**
 * TODO
 * 1. develop this iteratively in the browser
 * 2. move the logic here afterwards
 */
