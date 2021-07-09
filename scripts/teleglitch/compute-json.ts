import fs from 'fs';
import path from 'path';

modsLuaToJson();
luaGfxToJson();

/**
 * Convert lua functions calls in lua/gfx.lua into json
 */
function luaGfxToJson() {
  console.info('converting lua/gfx.lua ...');
  const absPath = path.resolve(__dirname, 'lua', 'gfx.lua');
  const lines = fs.readFileSync(absPath).toString()
    .split('\n')
    .filter(x => x.trim() && !x.trim().startsWith('--'));

  const sprites = {} as Record<string, Sprite>;
  const frames = {} as Record<string, Frame[]>;

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
        .map(x => {// Catch handles comment e.g. --katkiminev sein
          try { return x ? JSON.parse(x) : undefined; } catch { return x; }
        });
      
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
        .map(x => {
          try { return x ? JSON.parse(x) : undefined; } catch { return x; }
        });
      
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
      // JSON.stringify(v)
      v.map(x => JSON.stringify(x)).join(',\n  ')
    }\n]`).join(',\n')
  }}}`;
  JSON.parse(json);

  fs.writeFileSync(absPath.replace(/\.lua$/, '.json'),
  // JSON.stringify({ sprites, frames }, undefined, '  '),
  json,
);  
}

interface Sprite {
  name: string;
  texture: string;
  cols: number;
  rows: number;
  width: number;
  height: number;
  xOffset: number;
  yOffset: number;
  comment?: string;
}

interface Frame {
  /** Name of respective sprite */
  name: string;
  /** Frame identifier, wrt sprite */
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  comment?: string;
}

/**
 * This quick-n-dirty lua to json converter
 * expects a particular format, e.g.
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
    console.info('converting', `mods/${path.basename(absPath)}`, '...');
  
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

