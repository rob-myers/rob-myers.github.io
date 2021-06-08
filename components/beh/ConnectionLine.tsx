import React from 'react';
import { ConnectionLineComponentProps } from 'react-flow-renderer';

export default function ConnectionLine({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  connectionLineType,
  connectionLineStyle,
}: ConnectionLineComponentProps) {
  return (
    <g>
      <path
        fill="none"
        stroke="#222"
        strokeWidth={0.5}
      />
      <line
        className="animated"
        x1={sourceX} y1={sourceY}
        x2={targetX} y2={targetY}
        stroke="#888"
        strokeWidth={0.5}
      />
      <circle
        cx={targetX}
        cy={targetY}
        fill="#fff"
        r={2}
        stroke="#222"
        strokeWidth={0.5}
      />
    </g>
  );
};
