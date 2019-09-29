import * as themeUi from "theme-ui";
import { css as styledSystemCss } from "styled-system__css";

declare module "theme-ui" {
  /**
   * Fix missing type.
   */
  export const css: typeof styledSystemCss;
}
