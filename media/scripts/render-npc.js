/**
 * yarn render-npc {npc-name}
 * 
 * Examples:
 * - yarn render-npc first-npc
 */
import path from 'path';
import fs from 'fs';
import { error, info } from './service';
import { parseNpc } from '../../projects/service/npc';

const [,, npcName] = process.argv;
const npcDir = 'media/npc'
const npcFilepath = path.resolve(npcDir, npcName + '.svg');
if (!npcName || !fs.existsSync(npcFilepath)) {
  error(`error: usage: yarn render-npc {npc-name} where
    - media/npc/{npc-name}.svg exists
  `);
  process.exit(1);
}

const contents = fs.readFileSync(npcFilepath).toString();
const parsed = parseNpc(npcName, contents);
// TODO
console.log(parsed);
