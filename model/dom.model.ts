export function getWindow<T extends Record<string, any>>(): (Window & T) | undefined {
  return typeof window === 'undefined'
    ? undefined
    : window as unknown as (Window & T);
}

/**
 * Target element must have a bounding rect, so `window` is not supported.
 */
 export function getRelativePos(e: React.MouseEvent | MouseEvent): { x: number; y: number } {
  const { left, top } = (e.currentTarget! as Element).getBoundingClientRect();
  return { x: e.clientX - left, y: e.clientY - top };
}

 export function getNormDevicePos(e: React.MouseEvent | MouseEvent): { x: number; y: number } {
  const { left, top, width, height } = (e.currentTarget! as Element).getBoundingClientRect();
  return {
    x: ((e.clientX - left) / width) * 2 - 1,
    y: -((e.clientY - top) / height) * 2 + 1,
  };
}
