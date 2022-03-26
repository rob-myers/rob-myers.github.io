import fs from 'fs';
import stream from 'stream';
import util from 'util';
import { Canvas } from "canvas";

/**
 * @param {Canvas} canvas 
 * @param {string} outputPath 
 */
export function saveCanvasAsFile(canvas, outputPath) {
  return util.promisify(stream.pipeline)(
    canvas.createPNGStream(), 
    fs.createWriteStream(outputPath),
  );
}
