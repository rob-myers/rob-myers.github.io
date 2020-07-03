import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { LayoutPanelMeta } from '@model/layout/layout.model';
import { CustomPanelMetaKey } from '@model/layout/example-layout.model';
import { isAppPanel, isFilePanel } from '@model/code/dev-env.model';
import DevPanelMenu from './dev-panel-menu';
import css from './dev-panel.scss';

const DevEditor = dynamic(import('@components/dev-env/dev-editor'), { ssr: false });
const DevApp = dynamic(import('@components/dev-env/dev-app'), { ssr: false });

const WindowPanel: React.FC<Props> = ({ panelKey, panelMeta }) => {
  // Ensure layout tracks panel before mounting
  const panelTracked = useSelector(({ layout: { panel } }) => panel[panelKey]?.initialized);

  // Ensure dev-env tracks panel before mounting panel menu
  const devPanelTracked = useSelector(({ devEnv }) => !!devEnv.panelToMeta[panelKey]);
  
  return panelTracked ? (
    <>
      {devPanelTracked && <DevPanelMenu panelKey={panelKey} />}
      {isFilePanel(panelKey, panelMeta?.filename) && (
        <DevEditor
          filename={panelMeta!.filename!}
          panelKey={panelKey}
        />
      ) || isAppPanel(panelKey) && (
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


export default WindowPanel;
