import fs from 'fs';
import path from 'path';
import type * as Teleglitch from '../../types/teleglitch';

modsLuaToJson();
luaGfxToJson();
luaObjectsToJson();
luaOldwallsToJson();

function luaOldwallsToJson() {
  // TODO
}

function luaObjectsToJson() {
  console.info('converting lua/objects.lua...');
  const absPath = path.resolve(__dirname, 'lua', 'objects.lua');
  const jsCode = fs.readFileSync(absPath).toString()
    .split('--Mehe depth on 2')[0]
    .replace(/--/g, '//')
    .replace(/createfunction[^\n]+\n/g, '')
    .replace(/\n\s*([a-z]+)=([^\{])/g, '\n$1:$2');

  const objectlist = {};
  Function(
    'materials',
    'dofile',
    'objectlist',
    jsCode,
  )({}, () => {}, objectlist);

  fs.writeFileSync(
    absPath.replace(/\.lua$/, '.json'),
    `{\n${
      Object.entries(objectlist)
        .map(([k, v]) => `"${k}": ${JSON.stringify(v)}`)
        .join(',\n')
      }\n}`
  );
}

/**
 * Convert lua functions calls in `lua/gfx.lua` into json.
 */
function luaGfxToJson() {
  console.info('converting lua/gfx.lua...');
  const absPath = path.resolve(__dirname, 'lua', 'gfx.lua');
  const lines = fs.readFileSync(absPath).toString()
    .split('\n')
    .filter(x => x.trim() && !x.trim().startsWith('--'));

  const sprites = {} as Record<string, Teleglitch.Sprite>;
  const frames = {} as Record<string, Teleglitch.Frame[]>;

  function parseRowItem(x: string) {// Catch handles comment e.g. --katkiminev sein
    try { return x ? JSON.parse(x) : undefined; } catch {
      x = x[0] === ';' ? x.slice(1) : x;
      return x === '--' ? undefined : x || undefined;
    }
  }

  for (const line of lines) {
    if (line.startsWith('CreateSprite')) {
      const [
        name,
        texture,
        cols,
        rows,
        width,
        height,
        xOffset,
        yOffset,
        comment,
      ] = line.slice('CreateSprite('.length).split(/[,)]/)
        .map(x => x.trim())
        .map(parseRowItem);
      
      sprites[name] = {
        name,
        texture,
        cols,
        rows,
        width,
        height,
        xOffset,
        yOffset,
        comment,
      };

    } else if (line.startsWith('SetFrame')) {
      const [
        name,
        id,
        x1,
        y1,
        x2,
        y2,
        comment,
      ] = line.slice('SetFrame('.length).split(/[,)]/)
        .map(x => x.trim())
        .map(parseRowItem);
      
      (frames[name] = frames[name] || []).push({
        name,
        id,
        x1,
        y1,
        x2,
        y2,
        comment,
      });
    }
  }

  const json = `{"sprites":[\n  ${
    Object.values(sprites).map(v => JSON.stringify(v)).join(',\n  ')
  }\n],\n"frames":{\n${
    Object.entries(frames).map(([k, v]) => `"${k}":[\n  ${
      v.map(x => JSON.stringify(x)).join(',\n  ')
    }\n]`).join(',\n')
  }}}`;
  JSON.parse(json); // We verify the json

  fs.writeFileSync(absPath.replace(/\.lua$/, '.json'), json);  
}

/**
 * A quick-n-dirty lua to json converter
 * which expects a particular format, e.g.
 * ```lua
 * modlist["l1_1"]=
 * {
 * {type="rest",x=-1.79729,y=3.34492,angle=0.209439,frame=16,},
 * ...
 * {type="pfp",verts={281,54,55,56,},},
 * }
 * ```
 */
function modsLuaToJson() {
  const luaRegex = /\.lua$/;
  const luaFilepaths = fs.readdirSync(path.resolve(__dirname, 'mods'))
    .filter(x => luaRegex.test(x))
    .map(x => path.resolve(__dirname, 'mods', x));
  
  for (const absPath of luaFilepaths) {
    console.info('converting', `mods/${path.basename(absPath)}...`);
  
    const lines = fs.readFileSync(absPath).toString().split('\n');
    const moduleName = lines.shift()!.split('"')[1];
    lines.shift() && lines.pop();
  
    const jsonLines = lines.map(x => x
      .replace(/([a-zA-Z0-9]+)=/g, '"$1":')
      .replace(/\,\}/g, '}')
      .replace(/\{([\d\,]+)\}/g, '[$1]')
    );
    const jsonItems = `[\n${jsonLines.join('\n').slice(0, -1)}\n]`;
    JSON.parse(jsonItems); // Throws if malformed
  
    fs.writeFileSync(absPath.replace(luaRegex, '.json'),
      `{"moduleName":"${moduleName}", "items":${jsonItems}}`,
    );
  }
}
