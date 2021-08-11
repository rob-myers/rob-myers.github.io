/**
 * Example:
 * ```sh
 * # at repo root
 * nvm use # use expected node version
 * yarn convert-img 'media/downloads/Geomorphs/100x50 Edge' media/geomorph/edge
 * ```
 */
import fs from 'fs';

const [,, srcFolder, dstFolder] = process.argv;
const filenameRegex = /(^[\d,]+) \[(\d+x\d+)\] ([^(]*)(.*)\.png$/;

if (!srcFolder || !dstFolder || !fs.existsSync(srcFolder)) {
  console.error("ERROR: usage: yarn convert-img {src_folder} {dst_folder} where {src_folder} exists");
  process.exit(1);
}

const srcFilenames = fs.readdirSync(srcFolder);

interface FileMeta {
  srcName: string;
  /** Numeric identifier from Starship Geomorphs 2.0 */
  geomorphId: number;
  /** Dimension in grid squares of Starship Geomorphs 2.0 */
  gridDim: [number, number];
  dstName: string;
  tags: string[];
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
  const { filePrefix, tags } = extractMeta(description);

  return [{
    srcName,
    dstName: `${filePrefix}--${gridDim[0]}x${gridDim[1]}--${geomorphId}`,
    geomorphId,
    gridDim,
    tags,
  }];
});

/**
 * TODO
 * - write metas to manifest.json
 * - rename files and apply imagemagick trim
 */
console.log(fileMetas);

function extractMeta(info: string): { filePrefix: string; tags: string[] } {
  const tags = [] as string[];
  const parts = info.split(' ');

  if (parts[0] === '[Overlay]') {
    tags.push(parts.shift()!.slice(1, -1).toLowerCase());
  }
  if (parts[0].match(/^\(\d+\)$/)) {
    tags.push(`part-${parts.shift()!.slice(1, -1)}`);
  }
  if (parts[0].match(/^\d+x$/)) {
    tags.push(parts.shift()!.toLowerCase());
  }
  if (parts[0].match(/^\d.*[^-]$/)) {
    tags.push(parts.shift()!.toLowerCase());
  }

  const startBracket = parts.findIndex(x => x.startsWith('('));
  if (startBracket !== -1) {
    const bracketed = parts.splice(startBracket, parts.length).join(' ').slice(1, -1);
    tags.push(...bracketed
      .split(',')
      .map(x => restrictChars(x.trim()).split(' ').join('-')).filter(Boolean)
    );
  }
  
  return {
    filePrefix: restrictChars(parts.join('-')).replace(/--/g, '-'),
    tags,
  };
}

function restrictChars(word: string) {
  return word.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9- ]/g, '');
}
