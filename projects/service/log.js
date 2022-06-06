import chalk from "chalk";

/**
 * @param  {...string} args 
 */
 export function error(...args) {
  console.error(chalk.red(...args));
}
/**
 * @param  {...string} args 
 */
export function info(...args) {
  console.log(`INFO`, chalk.yellow(...args));
}
/**
 * @param  {...string} args 
 */
export function warn(...args) {
  console.warn(chalk.blueBright(...args));
}
