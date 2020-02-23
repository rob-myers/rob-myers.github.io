import { useSelector } from 'react-redux';
import css from './nav-dom.scss';
import { useMemo, useState, useEffect } from 'react';
import { Poly2 } from '@model/poly2.model';

const NavDomBackground: React.FC<Props> = ({
  uid,
}) => {
  const [faded, setFaded] = useState(true);
  const state = useSelector(({ nav: { dom } }) => dom[uid]);
  const navReady = state ? !state.updating : false;
  const navigable = state ? state.refinedNav || state.navigable : [];
  const navGraph = navReady ? state.navGraph : null;

  // TODO draw navgraph as test
  const { centers } = useMemo(() => {
    if (!navGraph) return { centers: [], segs: [] };
    const polyPs = state.refinedNav.map(({ allPoints }) => allPoints);
    const centers = navGraph.nodesArray.map(({ opts: { polyId, pointIds } }) =>
      Poly2.centerOf(pointIds.map(id => polyPs[polyId][id]))
    );
    return { centers, segs: [] };
  }, [navGraph]);

  useEffect(() => {
    setFaded(true);
    const fadeId = window.setTimeout(() => setFaded(false), 500);
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
              key={i}
              d={poly.svgPath}
              fill="none"
              stroke="#ccc"
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
            <circle key={i} cx={x} cy={y} r={2} fill="blue" />
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
