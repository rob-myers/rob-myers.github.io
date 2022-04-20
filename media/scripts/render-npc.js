/**
 * yarn render-npc {npc-name}
 * 
 * Examples:
 * - yarn render-npc first-npc
 */
import path from 'path';
import fs from 'fs';
import { parseNpc, renderNpcSpriteSheets } from '../../projects/service/npc';
import { writeAsJson } from '../../projects/service/file';
import { error } from '../../projects/service/log';

const [,, npcName] = process.argv;
const npcInputDir = 'media/npc'
const npcSvgFilepath = path.resolve(npcInputDir, npcName + '.svg');
if (!npcName || !fs.existsSync(npcSvgFilepath)) {
  error(`error: usage: yarn render-npc {npc-name} where
    - media/npc/{npc-name}.svg exists
  `);
  process.exit(1);
}

const publicDir = path.resolve(__dirname, '../../public');
const npcOutputDir = path.resolve(publicDir, 'npc');
const svgContents = fs.readFileSync(npcSvgFilepath).toString();

const zoom = 2;
const parsed = parseNpc(npcName, svgContents, zoom);
renderNpcSpriteSheets(parsed, npcOutputDir, zoom);
writeAsJson(parsed, path.resolve(npcOutputDir, npcName + '.json'));
