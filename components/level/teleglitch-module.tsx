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
    const img = new Image;
    img.src = '/api/teleglitch/gfx?set1.png';
  
    const [canvas, gfx, modules, objects] = await Promise.all([
      img.decode().then(() => {
        const canvas = document.createElement('canvas');
        [canvas.width, canvas.height] = [img.width, img.height];
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        return canvas;
      }),
      fetch('/api/teleglitch/lua?gfx.json').then(handleJsonFetch),
      fetch('/api/teleglitch/mods').then(handleJsonFetch),
      fetch('/api/teleglitch/lua?objects.json').then(handleJsonFetch),
    ]);

    return { spritesheet: canvas, gfx, modules, objects };
  }, useQueryOptions);

  useEffect(() => {
    if (teleglitch) {// TODO draw a module
      const ctxt = moduleCanvas.current!.getContext('2d')!;
      const sheet = teleglitch.spritesheet;
      // const module = teleglitch.modules.find(x => x.moduleName === 'algus3')!;
      // const module = teleglitch.modules.find(x => x.moduleName === 'l1_konservi_ladu')!;
      const module = teleglitch.modules.find(x => x.moduleName === 'l1_v2ike_ringaed')!;
      console.log(module, sheet);

      ctxt.resetTransform();
      ctxt.clearRect(0, 0, ctxt.canvas.width, ctxt.canvas.height);
      ctxt.translate(100, 40);
      ctxt.scale(10, 10);
      ctxt.scale(2, 1); // strange
      ctxt.strokeStyle = 'blue';
      ctxt.lineWidth = 0.05;
      const scale = 12; // important

      for (const item of module.items) {
        if (item.type === 'bmp' && item.tex === 'gfx/set1.png') {
          const [w, h] = [item.x2 - item.x1, item.y2 - item.y1];
          const [dw, dh] = [w / scale, h / scale];
          ctxt.save();
          ctxt.translate(item.x + (dw/2), item.y + (dh/2));
          ctxt.rotate(item.angle);
          ctxt.drawImage(sheet, item.x1, item.y1, w, h, -dw/2, -dh/2, dw, dh);
          // ctxt.strokeRect(-dw/2, -dh/2, dw, dh);
          ctxt.restore();
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
    <canvas
      ref={moduleCanvas}
      style={{
        border: '1px solid #555',
        width: 400,
        height: 400,
      }}
    />
  );
}

interface Teleglitch {
  /** Spritesheet `set1.png` */
  spritesheet: HTMLCanvasElement;
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
