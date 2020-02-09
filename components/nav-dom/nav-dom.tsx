import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNavElemId, observeOpts } from './nav.model';
import { Act, Thunk } from '@store/nav.duck';
import css from './nav-dom.scss';

/**
 * This component uses its DOM descendents to create a navmesh.
 */
const NavDom: React.FC<Props> = ({ uid, children }) => {

  const contentId = getNavElemId(uid, 'content');
  const dispatch = useDispatch();
  const contentDiv = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    dispatch(Act.registerNavDom(uid));

    // Compute navigation, updating on change.
    dispatch(Thunk.updateNavigable({ uid }));
    const observer = new MutationObserver(mutations => {
      console.log({ mutations });
      dispatch(Thunk.updateNavigable({ uid }));
    });
    observer.observe(contentDiv.current!, observeOpts);

    // Update on resize.
    const onResize = () => dispatch(Thunk.updateNavigable({ uid }));
    window.addEventListener('resize', onResize);

    return () => {
      dispatch(Act.unregisterNavDom(uid));
      observer.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  if (module.hot) {
    module.hot.accept('./nav-dom.scss', function() {
      dispatch(Thunk.updateNavigable({ uid }));
    });
  }

  const state = useSelector(({ nav: { dom } }) => dom[uid]);
  const navigable = state ? state.navigable : [];

  return (
    <div className={css.root}>
      <svg ref={svgRef} className={css.svg}>
        <g>
          {navigable.map((poly, i) => (
            <path
              key={i}
              d={poly.svgPath}
              fill="rgba(100, 100, 100, 0.05)"
              stroke="#ccc"
              strokeDasharray={3}
            />
          ))}
        </g>
        <g>
          {
            // navigable.map(({ triangulation }, i) =>
            navigable.map(({ customTriangulation: triangulation }, i) =>
              triangulation.map((triangle, j) => (
                <path
                  key={`${i}-${j}`}
                  d={triangle.svgPath}
                  fill="none"
                  stroke="red"
                  strokeWidth={0.1}
                />
              ))
            )}
        </g>
      </svg>
      <div id={contentId} ref={contentDiv} className={css.content}>
        {children}
      </div>
    </div>
  );
};

interface Props {
  uid: string;
  showMesh?: boolean;
}

export default NavDom;
