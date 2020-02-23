import { useSelector } from 'react-redux';
import css from './nav-dom.scss';
import { useMemo, useState, useEffect } from 'react';
import { Poly2 } from '@model/poly2.model';
import { Vector2 } from '@model/vec2.model';

const NavDomBackground: React.FC<Props> = ({
  uid,
}) => {
  const [faded, setFaded] = useState(true);
  const state = useSelector(({ nav: { dom } }) => dom[uid]);
  const navReady = state ? !state.updating : false;
  const navigable = state ? state.refinedNav || state.navigable : [];
  const navGraph = navReady ? state.navGraph : null;

  // TESTING: draw NavGraph
  const { centers, segs } = useMemo(() => {
    if (!navGraph) return { centers: [], segs: [] };
    const polyPs = state.refinedNav.map(({ allPoints }) => allPoints);
    const toCenter = navGraph.nodesArray.reduce(
      (agg, { id, opts: { polyId, pointIds } }) => ({
        ...agg,
        [id]: Poly2.centerOf(pointIds.map(id => polyPs[polyId][id])),
      }),
      {} as Record<string, Vector2>);
    const segs = navGraph.edgesArray.map(({ src, dst }) => [
      toCenter[src.id], toCenter[dst.id]
    ] as [Vector2, Vector2]);
    return { centers: Object.values(toCenter), segs };
  }, [navGraph]);

  // TODO use rxjs instead
  useEffect(() => {
    setFaded(true);
    const fadeId = window.setTimeout(() => setFaded(false), 200);
    return () => window.clearTimeout(fadeId);
  }, [navReady]);

  return (
    <svg
      className={css.svgRoot}
      style={{
        width: state ? state.worldBounds.width : 0,
        height: state ? state.worldBounds.height : 0,
      }}
    >
      <g className={[
        css.svgNavigable,
        faded ? css.pending : css.ready
      ].join(' ')}>
        <g>
          {/* Draw outline */}
          {navigable.map((poly, i) => (
            <path
              className={css.svgNavigableOutline}
              key={i}
              d={poly.svgPath}
              strokeDasharray={2}
            />
          ))}
        </g>
        <g>
          {/* Draw triangles */}
          {
            navigable.map(({ triangulation }, i) =>
              triangulation.map((triangle, j) => (
                <path
                  key={`${i}-${j}`}
                  d={triangle.svgPath}
                  fill="none"
                  stroke="#777"
                  strokeWidth={0.1}
                />
              ))
            )}
        </g>
        <g>
          {/* TESTING */}
          {centers.map(({ x, y }, i) => (
            <circle
              key={i}
              cx={x} cy={y} r={2}
              className={css.svgNavNode}
            />
          ))}
        </g>
        <g>
          {segs.map(([ src, dst ], i) => (
            <line
              key={i}
              x1={src.x} y1={src.y}
              x2={dst.x} y2={dst.y}
              className={css.svgNavEdge}
            />
          ))}
        </g>
      </g>
    </svg>
  );
};

interface Props {
  uid: string;
}

export default NavDomBackground;
