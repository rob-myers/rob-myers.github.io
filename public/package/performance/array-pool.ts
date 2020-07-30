/**
 * Pooled arrays to avoid garbage collection for intensive computation.
 * Source: https://github.com/mikolalysenko/typedarray-pool/blob/master/pool.js
 */
import * as bits from './bit-hacks';

const POOL = {
  DATA: Array(32).fill([] as ArrayBuffer[]),
};

const { DATA } = POOL;

/**
 * Allocate an Uint32Array with at least n 32-bit unsigned integers.
 */
export function mallocUint32(n: number) {
  return new Uint32Array(malloc(4 * n), 0, n);
}

/**
 * Allocate an Int32Array with at least n 32-bit signed integers.
 */
export function mallocInt32(n: number) {
  return new Int32Array(malloc(4 * n), 0, n);
}

/**
 * Allocate an ArrayBuffer with at least n bytes.
 */
function malloc(n: number) {
  n = bits.nextPow2(n);
  const d = DATA[bits.log2(n)];
  return d.length
    ? d.pop()
    : new ArrayBuffer(n);
}

export function free(array: Int32Array) {
  const log_n = bits.log2(array.length) | 0
  DATA[log_n].push(array)
}

export function clearCache() {
  for(let i = 0; i < 32; ++i) {
    DATA[i].length = 0;
  }
}
