export function extractMetaFromFilename(info: string): FilenameMeta {
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
    has.push(...bracketed.split(',')
      .map(x => restrictChars(x.trim()).split(' ').join('-')).filter(Boolean)
    );
  }
  
  return {
    filePrefix: restrictChars(parts.join('-')).replace(/-+/g, '-'),
    is,
    has,
  };
}

interface FilenameMeta {
  filePrefix: string;
  is: string[];
  has: string[];
}

function restrictChars(word: string) {
  return word.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9- ]/g, '');
}
