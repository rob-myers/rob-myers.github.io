import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNavElemId } from '@model/nav.model';
import { Act, Thunk } from '@store/nav.duck';
import css from './nav-dom.scss';

const NavDom: React.FC<Props> = ({
  uid,
  children,
  contentStyle,
  contentClass,
  navOutset,
}) => {
  const dispatch = useDispatch();
  const state = useSelector(({ nav: { dom } }) => dom[uid]);
  const navigable = state ? state.refinedNav || state.navigable : [];
  const [failed, setFailed] = useState(false);
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    if (!uid || dispatch(Thunk.domUidExists({ uid }))) {
      return setFailed(true);
    }

    dispatch(Thunk.ensureGlobalSetup({}));
    dispatch(Act.registerNavDom(uid));
    dispatch(Act.updateNavDom(uid, { navOutset }));
    setTimeout(() => dispatch(Thunk.updateNavigable({ uid })));

    // Update on resize or hot reload
    const onResize = () => dispatch(Thunk.updateNavigable({ uid }));
    window.addEventListener('resize', onResize);
    const hotHandler = (status: string) => status === 'idle'
      && dispatch(Act.updateDomMeta(uid, { justHmr: true }));
    module.hot && module.hot.addStatusHandler(hotHandler);

    setFaded(true); // Initial fade in
    window.setTimeout(() => setFaded(false), 500);

    return () => {
      if (!failed) {
        dispatch(Act.unregisterNavDom(uid));
        window.removeEventListener('resize', onResize);
        module.hot && module.hot.removeStatusHandler(hotHandler);
      }
    };
  }, []);

  useEffect(() => {
    if (state && navOutset && navOutset !== state.navOutset) {
      dispatch(Act.updateNavDom(uid, { navOutset }));
    }
  }, [navOutset]);

  useEffect(() => {
    // Rebuild navigation on 1st render after hot reload
    if (dispatch(Thunk.getDomMeta({ uid })).justHmr) {
      setFaded(true);
      dispatch(Thunk.updateNavigable({ uid }));
      dispatch(Act.updateDomMeta(uid, { justHmr: false }));
      window.setTimeout(() => setFaded(false), 500);
    }
  });

  if (failed) {
    return <div>{`Duplicate NavDom uid "${uid}" detected`}</div>;
  }

  return (
    <div style={{ position: 'relative' }}>
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
                // fill="rgba(100, 100, 100, 0.05)"
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
      <div
        id={getNavElemId(uid, 'content')}
        className={[css.contentRoot, contentClass].join(' ')}
        style={{ ...contentStyle }}
      >
        {children}
      </div>
    </div>
  );
};

interface Props {
  uid: string;
  showMesh?: boolean;
  navOutset?: number;
  contentStyle?: React.CSSProperties;
  contentClass?: string;
}

export default NavDom;
