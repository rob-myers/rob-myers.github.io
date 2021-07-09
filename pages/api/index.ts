import path from 'path';
/**
 * Absolute path to repo root.
 * We need three extra `..` to handle .next/server/pages.
 */
export const rootPath = path.resolve(__dirname, '../../../../..');
