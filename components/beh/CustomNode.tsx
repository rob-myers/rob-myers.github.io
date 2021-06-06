import React from 'react';
import { Handle, Position, Node } from 'react-flow-renderer';

export default React.memo(({ data }: Node) => {
  return (
    <>
      <div style={{ padding: 8, fontSize: 12, border: '1px solid black', background: 'rgba(255, 255, 255, 0.5)' }}>
        Custom Node
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={{ transform: 'translate(-10px, 0)', background: '#555' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={{ transform: 'translate(0px, 0)', background: '#555' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="c"
        style={{ transform: 'translate(10px, 0)', background: '#555' }}
      />
    </>
  );
});