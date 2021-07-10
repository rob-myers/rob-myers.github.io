import { useEffect, useRef } from "react";
import { useQuery } from "react-query";
import type * as Teleglitch from 'types/teleglitch';

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
      fetch('/api/teleglitch/lua?gfx.json').then(x => x.json()),
      fetch('/api/teleglitch/mods').then(x => x.json()),
      fetch('/api/teleglitch/lua?objects.json').then(x => x.json()),
    ]);

    return { canvas, gfx, modules, objects };
  }, { refetchOnWindowFocus: false });

  useEffect(() => {
    if (teleglitch) {// TODO draw a module
      const module = teleglitch.modules.find(x => x.moduleName === 'algus3')!;
      console.log(module);
      for (const item of module.items) {
        if (item.type === 'bmp') {
          // TODO
        } else if (false) {
          // TODO objects
        } else {
          console.warn('ignoring item', item.type);
        }
      } 
    }

  }, [teleglitch]);

  return (
    <canvas ref={moduleCanvas} style={{ border: '1px solid red' }} />
  );
}

interface Teleglitch {
  canvas: HTMLCanvasElement;
  gfx: Teleglitch.Gfx;
  modules: Teleglitch.Mods;
  objects: Teleglitch.Objects;
}
