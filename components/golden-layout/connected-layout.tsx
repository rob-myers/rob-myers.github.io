import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import GoldenLayout from 'golden-layout';
import { redact } from '@model/store/redux.model';
import { Act, Thunk } from '@store/layout.duck';

import DevPanel from '@components/dev-env/dev-panel';
import { ExtendedContainer } from '@model/layout/layout.model';
const GoldenLayoutComponent = dynamic(import('@components/golden-layout/golden-layout'), { ssr: false });

/**
 * Golden layout connected to redux state.
 * We expect at most one instance on the page.
 */
const ConnectedLayout: React.FC<Props> = ({ width, height, disabled, closable }) => {
  const dispatch = useDispatch();
  const nextConfig = useSelector(({ layout }) => layout.nextConfig);
  /** Used to remount on layout change */
  const [numChanges, setNumChanges] = useState(0);

  useEffect(() => {
    setNumChanges(numChanges + 1);
  }, [nextConfig]);

  const registerComponents = useCallback((gl: GoldenLayout) => {
    gl.registerComponent('window-panel', DevPanel);
    dispatch(Act.initialized({
      config: nextConfig,
      goldenLayout: redact(gl, 'GoldenLayout'),
    }));
  },[]);

  const onComponentCreated = useCallback((glCmp: ExtendedContainer) => {
    const { config, element: [el], tab } = glCmp;
      
    if (config.type === 'component') {
      const { props: { panelKey, panelMeta } } = config;

      const onClickTitle = () => dispatch(Thunk.clickedPanelTitle({ panelKey }));
      tab?.element.children('.lm_title')?.on('click', onClickTitle);

      dispatch(Act.panelCreated({
        panelKey,
        width: el.clientWidth,
        height: el.clientHeight,
        container: redact(glCmp, 'GoldenLayout.Container'),
        panelMeta: panelMeta || {},
      }));
      
      // Track panel closure in state.
      glCmp.container.on('destroy', () => {
        dispatch(Act.panelClosed({ panelKey }));
      });

      // Track panel resize.
      // Doesn't fire for dragged element when begin drag.
      glCmp.container.on('resize', () => {
        glCmp.tab?.element.children('.lm_title')?.off('click', onClickTitle);
        glCmp.tab?.element.children('.lm_title')?.on('click', onClickTitle);

        dispatch(Act.panelResized({
          panelKey,
          width: el.clientWidth,
          height: el.clientHeight,
        }));
      });

      // Fired just before show.
      glCmp.container.on('show', () => {
        setTimeout(() =>
          dispatch(Act.panelShown({
            panelKey,
            width: el.clientWidth,
            height: el.clientHeight,
          })), 0);
      });
    }
  }, []);

  const onDragStart = useCallback(() => null, []);

  return (
    <div className="connected-golden-layout">
      <div className={classNames({
        disabled,
        'no-closing': !closable,
      })}>
        <GoldenLayoutComponent
          key={`gl-${numChanges}`}
          htmlAttrs={{ style: {
            height,
            width,
          }}}
          initConfig={nextConfig}
          onComponentCreated={onComponentCreated}
          registerComponents={registerComponents}
          onDragStart={onDragStart}
        />
      </div>
    </div>
  );
};

interface Props {
  closable: boolean;
  disabled: boolean;
  width: string;
  height: string;
}

export default ConnectedLayout;
