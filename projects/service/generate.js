let count = 0;

/** @param {string} prefix */
export function generateId(prefix) {
  return `${prefix}${count++}`;
}
