import { css } from "goober";

export const iconCss = (
  basename: (
    | 'anchor-icon'
    | 'anchor-icon-white'
    | 'circle-xmark'
    | 'compress'
    | 'eye'
    | 'eye-slash'
    | 'ext-link-icon'
    | 'expand-solid'
    | 'info-icon'
  ),
  margin = 'auto',
  dimPx = 13
) => css`
  &::after {
    display: inline-block;
    content: '';
    background-image: url('/icon/${basename}.svg');
    background-size: ${dimPx}px ${dimPx}px;
    height: ${dimPx}px;
    width: ${dimPx}px;
    margin: ${margin};
  }
`;
