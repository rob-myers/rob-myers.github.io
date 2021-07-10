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
    const [canvas, gfx, modules] = await Promise.all([
      spritesheet.decode().then(() => {
        const canvas = document.createElement('canvas');
        [canvas.width, canvas.height] = [spritesheet.width, spritesheet.height];
        canvas.getContext('2d')!.drawImage(spritesheet, 0, 0);
        return canvas;
      }),
      fetch('/api/teleglitch/lua?gfx.json').then(x => x.json()),
      fetch('/api/teleglitch/mods').then(x => x.json()),
    ]);
    return { canvas, gfx, modules };
  }, { refetchOnWindowFocus: false });

  useEffect(() => {
    if (teleglitch) {
      // TODO draw a module e.g. l1_1
    }

    console.log(teleglitch);
  }, [teleglitch]);

  return (
    <canvas ref={moduleCanvas} style={{ border: '1px solid red' }} />
  );
}

interface Teleglitch {
  canvas: HTMLCanvasElement;
  gfx: Teleglitch.Gfx;
  modules: Teleglitch.Mods;
}
