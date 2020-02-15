import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNavElemId } from '@model/nav.model';
import { Act, Thunk } from '@store/nav.duck';
import css from './nav-dom.scss';

const NavDom: React.FC<Props> = ({
  uid,
  children,
  contentStyle,
  contentClass,
  width,
  height,
}) => {
  const contentId = getNavElemId(uid, 'content');
  const dispatch = useDispatch();
  const contentDiv = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const state = useSelector(({ nav: { dom } }) => dom[uid]);
  const navigable = state
    ? state.refinedNav || state.navigable
    : [];
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (dispatch(Thunk.domUidExists({ uid }))) {
      return setFailed(true);
    }
    module.hot && setFailed(false);

    dispatch(Thunk.ensureGlobalSetup({}));
    dispatch(Act.registerNavDom(uid));
    setTimeout(() => dispatch(Thunk.updateNavigable({ uid })));

    // Update on resize
    const onResize = () => dispatch(Thunk.updateNavigable({ uid }));
    window.addEventListener('resize', onResize);

    // Update on hot reload
    const hotHandler = (status: string) => {
      if (status === 'idle') {
        dispatch(Act.updateDomMeta(uid, { justHmr: true }));
      }
    };
    module.hot && module.hot.addStatusHandler(hotHandler);

    return () => {
      dispatch(Act.unregisterNavDom(uid));
      window.removeEventListener('resize', onResize);
      module.hot && module.hot.removeStatusHandler(hotHandler);
    };
  }, [uid]);

  useEffect(() => {
    // Rebuild navigation on 1st render after hot reload.
    if (dispatch(Thunk.getJustHmr({ uid }))) {
      dispatch(Thunk.updateNavigable({ uid }));
      dispatch(Act.updateDomMeta(uid, { justHmr: false }));
    }
  });

  if (failed) {
    return <div>{`Duplicate NavDom uid "${uid}" detected`}</div>;
  }

  return (
    <div>
      <svg
        ref={svg}
        className={css.svgRoot}
        style={{ width, height }}
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
            navigable.map(({ triangulation }, i) =>
            // navigable.map(({ customTriangulation: triangulation }, i) =>
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
        className={[css.contentRoot, contentClass].join(' ')}
        style={{ ...contentStyle, width, height }}
      >
        {children}
      </div>
    </div>
  );
};

interface Props {
  uid: string;
  showMesh?: boolean;
  width: React.ReactText;
  height: React.ReactText;
  contentStyle?: React.CSSProperties;
  contentClass?: string;
}

export default NavDom;
