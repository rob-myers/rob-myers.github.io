export function basename(str: string) {
  let base = str.substring(str.lastIndexOf('/') + 1); 
  if(base.lastIndexOf('.') != -1)       
    base = base.substring(0, base.lastIndexOf('.'));
  return base;
}

export function join(...args: string[]) {
  // Split the inputs into a list of path commands.
  let parts = [] as string[];
  for (let i = 0, l = args.length; i < l; i++) {
    parts = parts.concat(args[i].split('/'));
  }
  // Interpret the path commands to get the new resolved path.
  const newParts = [] as string[];
  for (let i = 0, l = parts.length; i < l; i++) {
    const part = parts[i];
    // Remove leading and trailing slashes
    // Also remove "." segments
    if (!part || part === '.') continue;
    // Interpret ".." to pop the last segment
    if (part === '..') newParts.pop();
    // Push new path segments.
    else newParts.push(part);
  }
  // Preserve the initial slash if there was one.
  if (parts[0] === '') newParts.unshift('');
  // Turn back into a single string path.
  return newParts.join('/') || (newParts.length ? '/' : '.');
}

export function dirname(path: string) {
  return join(path, '..');
}
