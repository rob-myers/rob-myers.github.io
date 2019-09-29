import React from "react";
import ReactSwitch, { ReactSwitchProps } from "react-switch";
import { css } from "@emotion/core";

interface Props
  extends Pick<
    ReactSwitchProps,
    | "checked" // required.
    | "onChange" // required.
    | "checkedIcon"
    | "uncheckedIcon"
    | "height"
    | "width"
    | "handleDiameter"
    | "offColor"
    | "onColor"
    | "boxShadow"
  > {}

export const Switch: React.FC<Props> = ({ checked, onChange, ...opts }) => {
  const props = {
    ...opts,
    checkedIcon: false,
    uncheckedIcon: false,
    height: 24,
    width: 48,
    handleDiameter: 24,
    offColor: `#000`,
    onColor: `#000`,
    boxShadow: `inset 0 0 0 1px #000`
  };

  return (
    <ReactSwitch
      css={css({
        bg: `primary`
      })}
      checked={checked}
      onChange={onChange}
      {...props}
    />
  );
};

export default Switch;
