import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Connection,
  Edge,
  Elements,
  OnLoadParams as ReactFlowInstance,
  Controls,
  Position,
  addEdge,
  removeElements,
  isEdge,
  useStoreActions,
  useStoreState,
  isNode,
} from 'react-flow-renderer';

import styled from '@emotion/styled';
import CustomNode from './CustomNode';
import ConnectionLine from './ConnectionLine';
import { deepClone, firstAvailableInteger } from 'model/generic.model';

export interface CustomNodeApi {
  onHandleClick: (nodeId: string, handleId: string) => void;
}

export default function ReactFlowExample() {
  const instance = useRef<ReactFlowInstance>();
  const nodeApi = useRef<CustomNodeApi>({
    onHandleClick: () => {},
  }).current;
  const [elements, setElements] = useState<Elements>(createElements(nodeApi));
  const selectedElements = useStoreState(state => state.selectedElements);
  const addSelectedElements = useStoreActions(act => act.addSelectedElements);
  const setSelectedElements = useStoreActions(act => act.setSelectedElements);
  const resetSelectedElements = useStoreActions(act => act.resetSelectedElements);
  const unsetNodesSelection = useStoreActions(act => act.unsetNodesSelection);
  const clipboard = useRef([] as Elements);

  useEffect(() => {
    const edges = elements.filter(isEdge);
    nodeApi.onHandleClick = (nodeId: string, handleId: string) => {
      // Select edges connected to node's handle
      addSelectedElements(edges.filter(x =>
        (x.source === nodeId && x.sourceHandle === handleId)
        || (x.target === nodeId && x.targetHandle === handleId)
      ));
    };
  }, [elements]);

  useEffect(() => void setTimeout(() => instance.current?.fitView()), []);

  const on = useMemo(() => ({
    elementsRemove: (elsToRemove: Elements) => {
      setElements((els) => els.length > 1 && elsToRemove.length < els.length
        ? removeElements(elsToRemove, els)
        : els);
    },
    connect: (params: Edge | Connection) => {
      setElements((els) => addEdge({ ...params, type: 'smoothstep' }, els));
    },
    load: (input: ReactFlowInstance) => {
      instance.current = input;
    },
    keyDown: (e: React.KeyboardEvent) => {
      if (e.metaKey) {
        const key = e.key.toLowerCase();
        switch (key) {
          case 'c':
          case 'x': {
            // getElements() provides up-to-date positions, unlike `selectedElements`
            const els = instance.current?.getElements() || [];
            const sel = (selectedElements || []).map(x => els.find(y => y.id === x.id)!);
            clipboard.current = deepClone(sel);
            if (key === 'x') {
              setElements(els => removeElements(selectedElements || [], els));
              resetSelectedElements();
              unsetNodesSelection();
            }
            break;
          }
          case 'v': {
            const els = instance.current?.getElements() || [];
            const newEls = computeElsToPaste(els, clipboard.current);
            newEls.filter(isNode).forEach(x => x.data.nodeApi = nodeApi);
            setElements(els => els.concat(newEls));
            setTimeout(() => setSelectedElements(newEls));
            break;
          }
        }
      } else if (e.key === 'Escape') {
        resetSelectedElements();
        unsetNodesSelection();
      }
    },
  }), [selectedElements]);

  return (
    <>
      <Toolbar>
        <div>toolbar</div>
      </Toolbar>
      <Wrapper
        style={{ height: 'calc(100% - 28px)' }}
        onKeyDown={on.keyDown}
        tabIndex={0}
      >
        <ReactFlow
          elements={elements}
          onConnect={on.connect}
          onElementsRemove={on.elementsRemove}
          zoomOnScroll={false}
          onLoad={on.load}
          snapToGrid
          nodeTypes={{ custom: CustomNode }}
          connectionLineComponent={ConnectionLine}
        >
            <Controls />
        </ReactFlow>
      </Wrapper>
    </>
  );
}

const Toolbar = styled.section`
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  font-size: 10pt;
  height: 28px;
  min-height: 28px;
  padding: 0 12px 0 8px;
  background-color: #333;
  color: #ddd;
`;

const Wrapper = styled.section`
  .react-flow__edge.selected .react-flow__edge-path {
    stroke: blue;
  }
`;

// Source/target handles start with s/t
function createElements(nodeApi: CustomNodeApi) {
  const initElements: Elements = [
    { id: '1', type: 'custom', data: { label: 'custom', srcs: ['sa', 'sb', 'sc'] }, position: { x: 250, y: 5 } },
    { id: '2', type: 'custom', data: { label: '1', dsts: ['ta'] }, position: { x: 100, y: 100 }, style: { width: 30 } },
    { id: '3', type: 'custom', data: { label: '2', dsts: ['ta'] }, position: { x: 200, y: 100 }, sourcePosition: Position.Right },
    { id: '4', type: 'custom', data: { label: '3', dsts: ['ta'] }, position: { x: 400, y: 100 } },
    { id: 'e1-2', source: '1', sourceHandle: 'sa', target: '2', targetHandle: 'ta', type: 'smoothstep' },
    { id: 'e1-3', source: '1', sourceHandle: 'sb', target: '3', targetHandle: 'ta', type: 'smoothstep' },
    { id: 'e1-4', source: '1', sourceHandle: 'sc', target: '4', targetHandle: 'ta', type: 'smoothstep' },
  ];
  initElements.slice(0, 4).forEach(x => x.data.nodeApi = nodeApi);
  return initElements;
}

/** Source elements may have been copied earlier, and are no longer in `current` */
function computeElsToPaste(current: Elements, srcEls: Elements) {
  const idToNewId = computeIdtoNewId(current, srcEls);
  const oldIds = Object.keys(idToNewId);
  const nodes = deepClone(srcEls.filter(isNode));
  const edges = deepClone(srcEls.filter(isEdge).filter(x => oldIds.includes(x.source) && oldIds.includes(x.target)));
  const dstEls = (nodes as Elements).concat(edges);
  dstEls.forEach(x => x.id = idToNewId[x.id]);
  edges.forEach(x => (x.source = idToNewId[x.source]) && (x.target = idToNewId[x.target]));
  return dstEls;
}
  
function computeIdtoNewId(current: Elements, srcEls: Elements) {
  const allIds = current.map(x => x.id);
  return srcEls.reduce((agg, { id }) => {
    if (allIds.includes(id)) {
      const prefix = `${id}.`;
      const ints = allIds.filter(x => x.startsWith(prefix))
        .map(x => Number(x.slice(prefix.length))).filter(x => !isNaN(x));
      agg[id] = `${prefix}${firstAvailableInteger(ints)}`;
    } else agg[id] = id;
    return agg;
  }, {} as Record<string, string>);
}
