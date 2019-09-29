/** @jsx jsx */
import { jsx } from "theme-ui";
import sun from "@assets/sun.png";
import moon from "@assets/moon.png";

export const checkedIcon = (
  <img
    alt="moon indicating dark mode"
    src={moon}
    width="16"
    height="16"
    role="presentation"
    sx={{
      pointerEvents: `none`,
      margin: 4
    }}
  />
);

export const uncheckedIcon = (
  <img
    alt="sun indicating light mode"
    src={sun}
    width="16"
    height="16"
    role="presentation"
    sx={{
      pointerEvents: `none`,
      margin: 4
    }}
  />
);
