/** @typedef {import('react').MouseEvent} MouseEvent */

export function getRelativePos(/** @type {MouseEvent} */ e) {
  const { left, top } = e.currentTarget.getBoundingClientRect();
  return [e.clientX - left, e.clientY - top];
}
