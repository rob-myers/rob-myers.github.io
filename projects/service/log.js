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
  console.info(chalk.yellow(...args));
}
/**
 * @param  {...string} args 
 */
export function warn(...args) {
  console.info(chalk.grey(...args));
}
