/**
 * Example: yarn convert-img 'media/downloads/Geomorphs/100x50 Edge' media/geomorph/edge
 */
import fs from 'fs';
import path from 'path';
import jsonStringifyPrettyCompact from 'json-stringify-pretty-compact';
import { extractMetaFromFilename } from './service';

const [,, srcDir, dstDir] = process.argv;
const filenameRegex = /(^[\d,]+) \[(\d+x\d+)\] ([^(]*)(.*)\.png$/;

if (!srcDir || !dstDir || !fs.existsSync(srcDir)) {
  console.error("ERROR: usage: yarn convert-img {src_folder} {dst_folder} where {src_folder} exists");
  process.exit(1);
}

const srcFilenames = fs.readdirSync(srcDir);
fs.mkdirSync(dstDir, { recursive: true });

interface FileMeta {
  srcName: string;
  /** Numeric identifier from Starship Geomorphs 2.0 */
  geomorphId: number;
  /** Dimension in grid squares of Starship Geomorphs 2.0 */
  gridDim: [number, number];
  dstName: string;
  is: string[];
  has: string[];
}

const fileMetas = srcFilenames.flatMap<FileMeta>(filename => {
  const matched = filename.match(filenameRegex);
  if (!matched) {
    console.warn('Ignoring unexpected PNG filename format:', filename);
    return [];
  }

  const srcName = matched[0];
  const geomorphId = Number(matched[1]);
  const gridDim = matched[2].split('x').map(x => Number(x) / 5) as [number, number];
  const description = matched[3].concat(matched[4]);
  const { filePrefix, is, has } = extractMetaFromFilename(description);

  return [{
    srcName,
    dstName: `${filePrefix}--${gridDim[0]}x${gridDim[1]}--${geomorphId}`,
    geomorphId,
    gridDim,
    is,
    has,
  }];
});

/**
 * TODO
 * - write metas to manifest.json
 * - rename files and apply imagemagick trim
 */
console.log(fileMetas);
fs.writeFileSync(path.join(dstDir, 'manifest.json'), jsonStringifyPrettyCompact({
  parentFolder: path.basename(srcDir),
  fileMetas,
}))
