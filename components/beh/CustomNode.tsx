import React from 'react';
import { Handle, Position, NodeProps } from 'react-flow-renderer';
import styled from '@emotion/styled';

export default React.memo(({ 
  data: { label, srcs = [], dsts = [] },
  selected,
}: NodeProps<{
  label: string;
  srcs?: string[];
  dsts?: string[];
  // TODO src can be down or right
  // TODO dst can be up or left
}>) => {
  const dxs = srcs.map((_, i) => (i * 10) - (0.5 * 10 * (srcs.length  - 1)) );

  return (
    <>
      <Contents selected={selected}>
        {label}
      </Contents>
      {srcs.map((id, i) => (
        <Handle
          type="source"
          position={Position.Bottom}
          id={id}
          style={{ transform: `translate(${dxs[i]}px, 0)`, background: '#555' }}
        />
      ))}
      {dsts.map((id, i) => (
        <Handle
          type="target"
          position={Position.Top}
          id={id}
          style={{ transform: `translate(${dxs[i]}px, 0)`, background: '#555' }}
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
