import * as React from 'react';
import { Rect } from '../geom';
import { generateId } from '../service';

/** @param {{ bounds: Rect }} props */
export function Grid(props) {
  const gridId = React.useMemo(() => generateId('grid-'), []);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement("defs",
      null,
      React.createElement("pattern", {
        id: gridId,
        width: "10",
        height: "10",
        patternUnits: "userSpaceOnUse"
      },
      React.createElement("path", {
        d: "M 10 0 L 0 0 0 10",
        fill: "none",
        stroke: "rgba(0,0,0,0.5)",
        strokeWidth: "0.3"
      }),
    )),
    React.createElement("rect", {
      x: props.bounds.x,
      y: props.bounds.y,
      width: props.bounds.width,
      height: props.bounds.height,
      fill: `url(#${gridId})`
    }),
  );
}