import * as React from 'react';
import { useDispatch } from 'react-redux';
import { BipartiteGraph, Edge } from '@reducer/bipartite.types';
import css from './index.scss';

const deltaX = 50;
const height = 200;

export const App: React.FC = () => {
  const [graph, setGraph] = React.useState<null | BipartiteGraph>(null); 
  const [matching, setMatching] = React.useState([] as Edge[]); 
  const dispatch = useDispatch();

  function nextRandomGraph() {
    const nextGraph = dispatch({
      type: '[bipartite] get random graph',
      args: { n: 10, m: 10, edgeProbability: 0.2 },
    });
    setGraph(nextGraph);
    setMatching(dispatch({ type: '[bipartite] get maximal matching', args: nextGraph }));
  }

  React.useEffect(() => void (!graph && nextRandomGraph()), [graph]);

  return graph ? (
    <div className={css.root}>
      <svg viewBox={`0 0 ${deltaX * (10 - 1)} ${height}`}>
        <g className={css.edges}>
          {graph.edges.map(([i, j], k) =>
            <line key={k} x1={deltaX * i} y1={height} x2={deltaX * j} y2={0} />)}
        </g>
        <g className={css.maximalMatching}>
          {matching.map(([i, j], k) =>
            <line key={k} x1={deltaX * i} y1={height} x2={deltaX * j} y2={0} />)}
        </g>
      </svg>
      <button onClick={nextRandomGraph}>
        Change
      </button>
    </div>
  ) : null;
};

export default App;
