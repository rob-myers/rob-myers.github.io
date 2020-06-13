import dynamic from 'next/dynamic';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import GoldenLayout from 'golden-layout';
import { redact } from '@model/store/redux.model';
import { Act, Thunk } from '@store/layout.duck';

import WindowPanel from '@components/dev-env/dev-panel';
import { ExtendedContainer } from '@model/layout/layout.model';
const GoldenLayoutComponent = dynamic(import('@components/golden-layout/golden-layout'), { ssr: false });

/**
 * Golden layout connected to redux state.
 * We expect at most one instance on the page.
 */
const ConnectedLayout: React.FC<Props> = ({ width, height, disabled, closable }) => {
  const dispatch = useDispatch();
  const initConfig = useSelector(({ layout }) => layout.initConfig);

  const registerComponents = useCallback((gl: GoldenLayout) => {
    gl.registerComponent('window-panel', WindowPanel);
    dispatch(Act.initialized({
      config: initConfig,
      goldenLayout: redact(gl, 'GoldenLayout'),
    }));
  },[]);

  const onComponentCreated = useCallback((glCmp: ExtendedContainer) => {
    const { config, element: [el], tab } = glCmp;
      
    if (config.type === 'component') {
      const { props: { panelKey } } = config;

      const onClickTitle = () => dispatch(Thunk.clickedPanelTitle({ panelKey }));
      tab?.element.children('.lm_title')?.on('click', onClickTitle);

      dispatch(Act.panelOpened({
        panelKey,
        width: el.clientWidth,
        height: el.clientHeight,
        container: redact(glCmp, 'GoldenLayout.Container'),
      }));
      
      // Track panel closure in state.
      glCmp.container.on('destroy', () => {
        // console.log('destroy', glCmp);
        dispatch(Act.panelClosed({ panelKey }));
      });

      // Track panel resize.
      // Doesn't fire for dragged element when begin drag.
      glCmp.container.on('resize', () => {
        // console.log('resize', glCmp.config.title, el.clientWidth, el.clientHeight);
        glCmp.tab?.element.children('.lm_title')?.off('click', onClickTitle);
        glCmp.tab?.element.children('.lm_title')?.on('click', onClickTitle);

        dispatch(Act.panelResized({
          panelKey,
          width: el.clientWidth,
          height: el.clientHeight,
        }));
      });
      // glCmp.container.on('hide', () => console.log('hide', glCmp));

      // Fired just before show.
      glCmp.container.on('show', () => {
        setTimeout(() =>
          dispatch(Act.panelShown({
            panelKey,
            width: el.clientWidth,
            height: el.clientHeight,
          })), 200);
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
          htmlAttrs={{ style: {
            height,
            width,
          }}}
          initConfig={initConfig}
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
