import * as React from 'react';
import { useDispatch } from 'react-redux';
import css from './index.scss';
import { BipartiteGraph, Edge } from '@model/geom/bipartite.model';

const [deltaX, height] = [50, 200];
const initGraph: BipartiteGraph = { n: 10, m: 10,
  edges: [...Array(10)].flatMap((_, i) => [[i, (i + 9) % 10], [i, (i + 1) % 10]]),
};

export const App: React.FC = () => {
  const [graph, setGraph] = React.useState(initGraph); 
  const [matching, setMatching] = React.useState([] as Edge[]); 
  const dispatch = useDispatch();

  function nextRandomGraph() {
    setMatching([]);
    setGraph(dispatch({
      type: '[bipartite] get random graph',
      args: { n: 10, m: 10, edgeProbability: 0.2 },
    }));
  }
  function computeMaximalMatching() {
    setMatching(dispatch({ type: '[bipartite] get maximal matching', args: graph }));
  }

  return (
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
      <div className={css.opts}>
        <button onClick={nextRandomGraph}>
          next graph
        </button>
        <button onClick={computeMaximalMatching}>
          max-matching
        </button>
      </div>
    </div>
  );
};

export default App;
