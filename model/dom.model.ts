export function getWindow<T extends Record<string, any>>(): (Window & T) | undefined {
  return typeof window === 'undefined'
    ? undefined
    : window as unknown as (Window & T);
}

export function getRelativePos(e: React.MouseEvent): { x: number; y: number } {
  const { left, top } = e.currentTarget.getBoundingClientRect();
  return { x: e.clientX - left, y: e.clientY - top };
}
