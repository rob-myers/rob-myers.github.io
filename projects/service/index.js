export { getSvgPos } from "./dom";

/**
 * The npm module "nanoid" breaks CodeSandbox HMR/reload.
 * To reproduce, hot modify PanZoom.jsx,
 * and then manually refresh in "Browser" tab.
 * You'll see: ModuleNotFoundError,
 * Could not find module in path: 'nanoid' relative to '/src/service/index.js'
 */
// export { nanoid } from "nanoid";
export { nanoid } from "./nanoid";
