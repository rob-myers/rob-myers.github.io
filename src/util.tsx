/**
 * Pretty-print JSON.
 */
export function pretty(input: any): string {
  return JSON.stringify(input, null, "\t");
}

/**
 * Usage `default: throw testNever(x)`.
 */
export function testNever(x: never): string {
  return `testNever: ${pretty(x)} not implemented.`;
}
