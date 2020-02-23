import { useSelector } from 'react-redux';
import css from './nav-dom.scss';

const NavDomBackground: React.FC<Props> = ({
  uid,
  faded,
}) => {
  const state = useSelector(({ nav: { dom } }) => dom[uid]);
  const navigable = state ? state.refinedNav || state.navigable : [];

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
      </g>
    </svg>
  );
};

interface Props {
  uid: string;
  faded: boolean;
}

export default NavDomBackground;
