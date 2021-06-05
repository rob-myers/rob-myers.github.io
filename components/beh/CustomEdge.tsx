import React from 'react';
import { getBezierPath, getMarkerEnd } from 'react-flow-renderer';


export default React.memo(function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  arrowHeadType,
  markerEndId,
}: any) {
  const edgePath = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        style={style}
        d={edgePath}
        markerEnd={markerEnd}
      />
      <text>
        <textPath
          href={`#${id}`}
          style={{ fontSize: '12px', userSelect: 'none' }}
          startOffset="50%"
          textAnchor="middle"
          alignmentBaseline="central"
        >
          {data.text}
        </textPath>
      </text>
    </>
  );
})