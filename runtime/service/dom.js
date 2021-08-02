/** @typedef {import('react')} React */

export function getRelativePos(/** @type {React.MouseEvent} */ e) {
  const { left, top } = e.currentTarget.getBoundingClientRect();
  return [e.clientX - left, e.clientY - top];
}
