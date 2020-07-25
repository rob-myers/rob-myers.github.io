/**
 * Sources
 * - https://github.com/mikolalysenko/bit-twiddle/blob/master/twiddle.js
 * - http://graphics.stanford.edu/~seander/bithacks.html
 */

/**
* Compute log_2 of a 32 bit number.
*/
export function log2(v: number) {
  var r, shift;
  r =     (v > 0xFFFF) as any << 4; v >>>= r;
  shift = (v > 0xFF  ) as any << 3; v >>>= shift; r |= shift;
  shift = (v > 0xF   ) as any << 2; v >>>= shift; r |= shift;
  shift = (v > 0x3   ) as any << 1; v >>>= shift; r |= shift;
  return r | (v >> 1);
}

/**
 * Round up to next power of 2.
 */
export function nextPow2(v: number) {
  v += (v === 0) as any;
  --v;
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  return v + 1;
}
