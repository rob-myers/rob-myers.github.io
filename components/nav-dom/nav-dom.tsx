import { useEffect, useState, useRef } from 'react';
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
  const failedRef = useRef(false);
  const [svgFaded, setSvgFaded] = useState(true);

  useEffect(() => {
    if (dispatch(Thunk.domUidExists({ uid }))) {
      failedRef.current = true;
      console.error(`Duplicate NavDom uid "${uid}" detected`);
      return;
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
    // Initial fade-in
    const fadeId = window.setTimeout(() => setSvgFaded(false), 500);

    return () => {
      if (!failedRef.current) {
        window.clearTimeout(fadeId);
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

  useEffect(() => {// Rebuild nav on 1st render after hot reload
    if (dispatch(Thunk.getDomMeta({ uid })).justHmr) {
      dispatch(Thunk.updateNavigable({ uid }));
      dispatch(Act.updateDomMeta(uid, { justHmr: false }));
      setSvgFaded(true);
      window.setTimeout(() => setSvgFaded(false), 500);
    }
  });

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
          svgFaded ? css.pending : css.ready
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
      <div
        id={getNavElemId({ key: 'content', domUid: uid })}
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
