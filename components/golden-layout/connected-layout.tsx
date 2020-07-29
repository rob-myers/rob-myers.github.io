import * as shortId from 'shortid';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import GoldenLayout from 'golden-layout';

import { redact } from '@model/store/redux.model';
import { ExtendedContainer, ComponentConfig, GoldenLayoutConfigItem } from '@model/layout/layout.model';
import { Act, Thunk } from '@store/layout.duck';
import { Act as DevEnvAct } from '@store/dev-env.duck';

import DevPanel from '@components/dev-env/dev-panel';
import { Props as GlProps } from './golden-layout';
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
    dispatch(Act.initialized({ goldenLayout: redact(gl, 'GoldenLayout')  }));
  },[]);

  const onComponentCreated = useCallback((glCmp: ExtendedContainer) => {
    const { config, element: [el], tab } = glCmp;
      
    if (config.type === 'component') {
      const { panelKey, panelMeta } = config.props;

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
      glCmp.container.on('destroy', (cmp: GoldenLayout.ContentItem) => {
        dispatch(Act.panelClosed({
          panelKey,
          siblingKeys: (cmp.parent.contentItems || [])
            .map(x => (x.config as ComponentConfig<string>)?.props.panelKey)
            .filter(x => !!x && x !== panelKey),
        }));
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
            siblingKeys: (glCmp.parent.contentItems || [])
              .map(x => (x.config as ComponentConfig<string>)?.props.panelKey)
              .filter(Boolean),
          })), 0);
      });
    }
  }, []);

  const onDragStart = useCallback(() => null, []);

  const setupCustomIcons: GlProps['setupCustomIcons'] = (tab) => {
    const li = document.createElement('li');
    li.className = 'lm_custom_open';
    li.title="open file or app"
    li.id = `gl-icon-${shortId.generate()}`;

    li.addEventListener('click', () => {
      const config = tab.header.activeContentItem.config as GoldenLayoutConfigItem<string>;
      const panelKey = 'type' in config && config.type === 'component' && config.props.panelKey || null;
      if (panelKey) {
        const siblingKeys = (tab.header.activeContentItem.parent.contentItems || [])
          .map(x => (x.config as ComponentConfig<string>)?.props.panelKey)
          .filter(Boolean);
        dispatch(DevEnvAct.xorPanelOpener({ panelKey, elementId: li.id, siblingKeys }));
      }
    });

    tab.header.controlsContainer.prepend(li);
  };

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
          setupCustomIcons={setupCustomIcons}
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
