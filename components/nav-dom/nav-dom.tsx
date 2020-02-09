import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNavElemId, observeOpts } from './nav.model';
import { Act, Thunk } from '@store/nav.duck';

const NavDom: React.FC<Props> = ({
  uid,
  children,
  contentStyle = {},
  width,
  height,
}) => {
  const contentId = getNavElemId(uid, 'content');
  const dispatch = useDispatch();
  const contentDiv = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    dispatch(Act.registerNavDom(uid));
    dispatch(Thunk.updateNavigable({ uid }));

    // Update on change/resize.
    const observer = new MutationObserver(mutations => {
      console.log({ mutations });
      dispatch(Thunk.updateNavigable({ uid }));
    });
    observer.observe(contentDiv.current!, observeOpts);
    const onResize = () => dispatch(Thunk.updateNavigable({ uid }));
    window.addEventListener('resize', onResize);

    return () => {
      dispatch(Act.unregisterNavDom(uid));
      observer.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const state = useSelector(({ nav: { dom } }) => dom[uid]);
  const navigable = state ? state.navigable : [];

  return (
    <div>
      <svg
        ref={svgRef}
        style={{ width, height, position: 'absolute', zIndex: -10 }}
      >
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
                  stroke="#777"
                  strokeWidth={0.1}
                />
              ))
            )}
        </g>
      </svg>
      <div
        id={contentId}
        ref={contentDiv}
        style={{ ...contentStyle, width, height, margin: '0 auto', overflow: 'hidden' }}
      >
        {children}
      </div>
    </div>
  );
};

interface Props {
  uid: string;
  showMesh?: boolean;
  width: number;
  height: number;
  contentStyle?: React.CSSProperties;
}

export default NavDom;
