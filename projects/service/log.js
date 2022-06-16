import chalk from "chalk";

/**
 * @param  {...any} args 
 */
 export function error(...args) {
  console.error('ERROR', chalk.red(...args));
}
/**
 * @param  {...any} args 
 */
export function info(...args) {
  console.info('INFO', chalk.blueBright(...args));
}
/**
 * @param  {...any} args 
 */
export function warn(...args) {
  console.warn('WARN', chalk.yellowBright(...args));
}
