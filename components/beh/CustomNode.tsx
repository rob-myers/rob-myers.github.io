import React from 'react';
import { Handle, Position, NodeProps } from 'react-flow-renderer';
import styled from '@emotion/styled';
import { CustomNodeApi } from './ReactFlowDemo';

export default React.memo(({
  id,
  data: {
    label,
    srcs = [],
    dsts = [],
    nodeApi,
  },
  selected,
}: NodeProps<{
  label: string;
  srcs?: string[];
  dsts?: string[];
  nodeApi: CustomNodeApi;
  // TODO src can be down or right
  // TODO dst can be up or left
}>) => {
  const dxs = srcs.map((_, i) => (i * 15) - (0.5 * 15 * (srcs.length  - 1)) );

  return (
    <>
      <Contents selected={selected}>
        {label}
      </Contents>
      {srcs.map((srcId, i) => (
        <Handle
          key={srcId}
          type="source"
          position={Position.Bottom}
          id={srcId}
          style={{ transform: `translate(${dxs[i]}px, 0)`, background: '#555' }}
          onClick={() => nodeApi.onHandleClick(id, srcId)}
        />
      ))}
      {dsts.map((dstId, i) => (
        <Handle
          key={dstId}
          type="target"
          position={Position.Top}
          id={dstId}
          style={{ transform: `translate(${dxs[i]}px, 0)`, background: '#555' }}
          onClick={() => nodeApi.onHandleClick(id, dstId)}
        />
      ))}
    </>
  );
});

const Contents = styled.div<{ selected: boolean }>`
  padding: 8px;
  font-size: 12pt;
  border: 1px solid ${({ selected }) => selected ? 'blue' : 'black'}; 
  background: rgba(255, 255, 255, 0.5);
`;
