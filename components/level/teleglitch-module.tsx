import { useEffect, useRef } from "react";
import { useQuery } from "react-query";
import type * as Teleglitch from 'types/teleglitch';
import { handleJsonFetch, useQueryOptions } from "model/query.model";

/**
 * This component is available in development only, because it
 * depends on teleglitch game files which are not publicly available.
 */
export default function TeleglitchModule() {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  const moduleCanvas = useRef<HTMLCanvasElement>(null);

  const { data: teleglitch } = useQuery<Teleglitch>('teleglitch', async () => {
    const spritesheet = new Image;
    spritesheet.src = '/api/teleglitch/gfx?set1.png';
  
    const [canvas, gfx, modules, objects] = await Promise.all([
      spritesheet.decode().then(() => {
        const canvas = document.createElement('canvas');
        [canvas.width, canvas.height] = [spritesheet.width, spritesheet.height];
        canvas.getContext('2d')!.drawImage(spritesheet, 0, 0);
        return canvas;
      }),
      fetch('/api/teleglitch/lua?gfx.json').then(handleJsonFetch),
      fetch('/api/teleglitch/mods').then(handleJsonFetch),
      fetch('/api/teleglitch/lua?objects.json').then(handleJsonFetch),
    ]);

    return { canvas, gfx, modules, objects };
  }, useQueryOptions);

  useEffect(() => {
    if (teleglitch) {// TODO draw a module
      const module = teleglitch.modules.find(x => x.moduleName === 'l1_2')!;
      console.log(module);
      for (const item of module.items) {
        if (item.type === 'bmp' && item.tex === 'gfx/set1.png') {
          // TODO
        } else if (item.type in teleglitch.objects) {
          // TODO
        } else if (item.type === 'node') {
          // TODO
        } else if (item.type === 'light') {
          // TODO
        } else if (item.type === 'pfv' || item.type === 'pfp') {
          // TODO
        } else if (ignoredModuleItems.includes(item.type)) {
          // Ignore silently
        } else {
          console.warn('ignoring item:', item.type);
        }
      } 
    }

  }, [teleglitch]);

  return (
    <canvas ref={moduleCanvas} style={{ border: '1px solid red' }} />
  );
}

interface Teleglitch {
  /** Spritesheet `set1.png` */
  canvas: HTMLCanvasElement;
  gfx: Teleglitch.Gfx;
  modules: Teleglitch.Mods;
  objects: Teleglitch.Objects;
}

const ignoredModuleItems: Teleglitch.ModItem['type'][] = [
  'container',
  'emptycan',
  'door',
  'directioncontroller',
  'giant_zombie',
  'mapmarker',
  'soundemitter',
  'terminal',
];
