import { useEffect } from "react";
import { useQuery } from "react-query";

/**
 * This component is available in development only, because it
 * depends on teleglitch game files which are not publicly available.
 */
export default function TeleglitchModule() {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const { data: teleglitch } = useQuery('teleglitch', async () => {
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
    console.log(teleglitch);
  }, [teleglitch]);

  return (
    <div />
  );
}
