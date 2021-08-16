export interface FileMeta {
  srcName: string;
  /** Numeric identifier from Starship Geomorphs 2.0 */
  id: number;
  /** Sometimes a range is given */
  ids: number[];
  /** Dimension in grid squares of Starship Geomorphs 2.0 */
  gridDim: [number, number];
  dstName: string;
  is: string[];
  has: string[];
}

export function metaFromRootFilename(matched: RegExpMatchArray): FileMeta {
  const srcName = matched[0];
  const gridDim = matched[1].split('x').map(x => Number(x) / 5) as [number, number];
  const id = -1;
  const ids = [id];
  const description = normalizeChars(matched[2]);
  const dstName = `${gridDim[0]}x${gridDim[1]}${description ? `--${description}` : ''}.png`;
  return { srcName, dstName, id, gridDim, is: ['root'], has: [], ids };
}

export function metaFromGeomorphFilename(matched: RegExpMatchArray): FileMeta {
  const srcName = matched[0];
  const ids = matched[1].split(',').map(Number);
  const id = ids[0];
  const gridDim = matched[2].split('x').map(x => Number(x) / 5) as [number, number];
  const description = matched[3].concat(matched[4]);
  const { label, is, has } = extractGeomorphInfo(description);
  const dstName =`g-${matched[1].split(',')[0]}--${label}.png`;
  return { srcName, dstName, id, gridDim, is, has, ids };
}

export function metaFromSymbolFilename(matched: RegExpMatchArray): FileMeta {
  const srcName = matched[0];
  const category = normalizeChars(matched[1]);
  const id = Number(matched[2]);
  const ids = [id];
  const gridDim = matched[4].split('x').map(x => Number(x) / 5) as [number, number];
  // ids are local unlike geomorphs
  const dstName = `${category}--${matched[2]}--${gridDim[0]}x${gridDim[1]}.png`;
  const is = [] as string[];
  if (matched[3]) is.push(`part-${matched[3]}`);
  if (matched[5]) is.push(normalizeChars(matched[5]));
  return { srcName, dstName, id, gridDim, is, has: [], ids };
}

function extractGeomorphInfo(info: string): FilenameMeta {
  const is = [] as string[];
  const has = [] as string[];
  const parts = info.split(' ');

  if (parts[0] === '[Overlay]') {
    is.push(parts.shift()!.slice(1, -1).toLowerCase());
  }
  if (parts[0].match(/^\(\d+\)$/)) {
    is.push(`part-${parts.shift()!.slice(1, -1)}`);
  }
  if (parts[0].match(/^\d+x$/)) {
    is.push(parts.shift()!.toLowerCase());
  }

  const startBracket = parts.findIndex(x => x.startsWith('('));
  if (startBracket !== -1) {
    const bracketed = parts.splice(startBracket, parts.length).join(' ').slice(1, -1);
    has.push(...bracketed.split(',').map(x => normalizeChars(x)).filter(Boolean));
  }
  
  return {
    label: normalizeChars(parts.join('-')),
    is,
    has,
  };
}

interface FilenameMeta {
  label: string;
  is: string[];
  has: string[];
}

function normalizeChars(word: string) {
  return word.trim().toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[ -]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  ;
}

import chalk from "chalk";

export function error(...args: string[]) {
  console.error(chalk.red(...args));
}
export function info(...args: string[]) {
  console.info(chalk.yellow(...args));
}
export function warn(...args: string[]) {
  console.info(chalk.grey(...args));
}