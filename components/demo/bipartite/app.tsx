import * as React from 'react';
import { useSelector } from 'react-redux';
import { BipartiteGraph, BipartiteEdge } from '@model/geom/bipartite.model';
import css from './index.scss';

const [deltaX, height] = [50, 200];
const initGraph: BipartiteGraph = { n: 10, m: 10,
  edges: [...Array(10)].flatMap((_, i) => [[i, (i + 9) % 10], [i, (i + 1) % 10]]),
};

export const App: React.FC = () => {
  const [graph, setGraph] = React.useState(initGraph); 
  const [matching, setMatching] = React.useState([] as BipartiteEdge[]); 
  const geom = useSelector(({ geom }) => geom.service);

  function nextRandomGraph() {
    setGraph(geom.randomBipartiteGraph(10, 10, 0.2));
  }

  async function computeMaximalMatching() {
    const { edges } = await geom.maximalMatching(graph);
    setMatching(edges);
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
