import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { LayoutPanelMeta } from '@model/layout/layout.model';
import { CustomPanelMetaKey } from '@model/layout/example-layout.model';
import { isAppPanel, isFilePanel } from '@model/code/dev-env.model';
import DevPanelMenu from './dev-panel-menu';
import css from './dev-panel.scss';

const DevEditor = dynamic(import('@components/dev-env/dev-editor'), { ssr: false });
const DevApp = dynamic(import('@components/dev-env/dev-app'), { ssr: false });

/**
 * TODO
 * - create/forget devEnv.panelMeta here (not in dev-env.duck or DevApp)
 * - use it to decide on DevEditor or DevApp.
 * - can then change this meta to change panel contents,
 *   in which case we should also mutate gl config
 */
const DevPanel: React.FC<Props> = ({ panelKey, panelMeta }) => {
  // Ensure layout tracks panel before mounting
  const panelTracked = useSelector(({ layout: { panel } }) => panel[panelKey]?.initialized);

  // Ensure dev-env tracks panel before mounting panel menu
  const devPanelTracked = useSelector(({ devEnv }) => !!devEnv.panelToMeta[panelKey]);
  
  return panelTracked ? (
    <>
      {devPanelTracked &&
        <DevPanelMenu panelKey={panelKey} />
      }
      {isFilePanel(panelMeta!) && (
        <DevEditor
          filename={panelMeta.filename}
          panelKey={panelKey}
        />
      ) || isAppPanel(panelMeta!) && (
        <DevApp
          panelKey={panelKey}
        />
      ) || (
        <div className={css.unsupportedPanel}>{
          `Unsupported panel "${panelKey}" with meta "${JSON.stringify(panelMeta)}"`
        }</div>
      )}
    </>
  ) : null;
};

interface Props {
  panelKey: string;
  panelMeta?: LayoutPanelMeta<CustomPanelMetaKey>;
}


export default DevPanel;
