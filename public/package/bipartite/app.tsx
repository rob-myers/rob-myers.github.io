import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Edge } from './matching';
import css from './index.scss';

export const App: React.FC = () => {
  const [graph, setGraph] = React.useState(getRandomGraph()); 
  const [matching, setMatching] = React.useState([] as Edge[]); 
  const dispatch = useDispatch();

  React.useEffect(() => {
    console.log({ graph });
    const matching = dispatch({ type: '[@bipartite] maximal matching', args: {
      n: graph.ns.length,
      m: graph.ms.length,
      edges: graph.edges,
    }});
    console.log({ matching });
    setMatching(matching);
  }, [graph]);

  return (
    <div className={css.root}>
      <svg>
        <g transform="translate(20 20)">
          <g>
            {graph.ns.map(i => <circle key={i} r={2} cx={20 * i} cy={100} fill="red" />)}
          </g>
          <g>
            {graph.ms.map(j => <circle key={j} r={2} cx={20 * j} cy={0} fill="red" />)}
          </g>
          <g>
            {graph.edges.map(([i, j], k) =>
              <line key={k} x1={20 * i} y1={100} x2={20 * j} y2={0} stroke="black" />)
            }
          </g>
          <g>
            {matching.map(([i, j], k) =>
              <line key={k} x1={20 * i} y1={100} x2={20 * j} y2={0} stroke="red" />)
            }
          </g>
        </g>
      </svg>
      <button onClick={() => setGraph(getRandomGraph())}>
        Change
      </button>
    </div>
  );
};

function getRandomGraph() {
  const n = Math.trunc(Math.random() * 10) + 5;
  const m = Math.trunc(Math.random() * 10) + 5;
  const edges = [] as Edge[];
  Array(n).fill(null).forEach((_, i) =>
    Array(m).fill(null).forEach((_, j) =>
      Math.random() > 0.75 && edges.push([i, j])
  ));
  return {
    ns: [...Array(n)].map((_, i) => i),
    ms: [...Array(m)].map((_, i) => i),
    edges,
  };
}

export default App;
