import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Edge } from './matching';
import { BipartiteGraph } from './bipartite.duck';
import css from './index.scss';

const r = 2;
const dx = 50;
const h = 200;

export const App: React.FC = () => {
  const [graph, setGraph] = React.useState<null | BipartiteGraph>(null); 
  const [matching, setMatching] = React.useState([] as Edge[]); 
  const ns = React.useMemo(() => [...Array(graph?.n || 0)].map((_, i) => i), [graph]);
  const ms = React.useMemo(() => [...Array(graph?.m || 0)].map((_, i) => i), [graph]);

  const dispatch = useDispatch();

  function nextRandomGraph() {
    const nextGraph = dispatch({ type: '[@bipartite] get random graph', args: {
      lower: [10, 10],
      upper: [10, 10],
      edgeProbability: 0.2,
    } })
    setMatching(dispatch({ type: '[@bipartite] maximal matching', args: {
      n: nextGraph.n,
      m: nextGraph.m,
      edges: nextGraph.edges,
    }}));
    setGraph(nextGraph);
  }

  React.useEffect(() => void !graph && nextRandomGraph(), [graph]);

  return graph ? (
    <div className={css.root}>
      <svg viewBox={`0 0 ${dx * (10 - 1)} ${h}`}>
        <g>
          <g className={css.edges}>
            {graph.edges.map(([i, j], k) =>
              <line key={k} x1={dx * i} y1={h} x2={dx * j} y2={0} />)}
          </g>
          <g className={css.maximalMatching}>
            {matching.map(([i, j], k) =>
              <line key={k} x1={dx * i} y1={h} x2={dx * j} y2={0} />)}
          </g>
          <g className={css.lowerBipartition}>
            {ns.map(i => <circle key={i} r={r} cx={dx * i} cy={h} />)}
          </g>
          <g className={css.upperBipartition}>
            {ms.map(j => <circle key={j} r={r} cx={dx * j} cy={0} />)}
          </g>
        </g>
      </svg>
      <button onClick={nextRandomGraph}>
        Change
      </button>
    </div>
  ) : null;
};

export default App;
