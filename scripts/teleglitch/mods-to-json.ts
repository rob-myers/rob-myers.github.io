import fs from 'fs';
import path from 'path';

const luaRegex = /\.lua$/;
const luaFilepaths = fs.readdirSync(path.resolve(__dirname, 'mods'))
  .filter(x => luaRegex.test(x))
  .map(x => path.resolve(__dirname, 'mods', x));

/**
 * This quick and dirty converter expects a particular format:
 * ```lua
 * modlist["l1_1"]=
 * {
 * {type="rest",x=-1.79729,y=3.34492,angle=0.209439,frame=16,},
 * ...
 * {type="pfp",verts={281,54,55,56,},},
 * }
 * ```
 */
for (const absPath of luaFilepaths) {
  const lines = fs.readFileSync(absPath).toString().split('\n');
  const moduleName = lines.shift()!.split('"')[1];
  lines.shift() && lines.pop();

  const jsonLines = lines.map(x => x
    .replace(/([a-zA-Z0-9]+)=/g, '"$1":')
    .replace(/\,\}/g, '}')
    .replace(/\{([\d\,]+)\}/g, '[$1]')
  );
  const json = `[\n${jsonLines.join('\n').slice(0, -1)}\n]`;
  JSON.parse(json); // Throws if malformed

  fs.writeFileSync(
    absPath.replace(luaRegex, '.json'),
    `{\n"moduleName": "${moduleName}",\n"items":${json}\n}`,
  );
}
