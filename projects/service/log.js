import chalk from "chalk";

/**
 * @param  {...string} args 
 */
 export function error(...args) {
  console.error('ERROR', chalk.red(...args));
}
/**
 * @param  {...string} args 
 */
export function info(...args) {
  console.info('INFO', chalk.blueBright(...args));
}
/**
 * @param  {...string} args 
 */
export function warn(...args) {
  console.warn('WARN', chalk.yellowBright(...args));
}
