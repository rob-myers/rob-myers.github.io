import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LayoutPanelMeta } from '@model/layout/layout.model';
import { CustomPanelMetaKey } from '@model/layout/generate-layout';
import { isAppPanel, isFilePanel, isDocPanel } from '@model/dev-env/dev-env.model';
import { Act } from '@store/dev-env.duck';
import DevDoc from './dev-doc';
import css from './dev-panel.scss';

const DevEditor = dynamic(import('@components/dev-env/dev-editor'), { ssr: false });
const DevApp = dynamic(import('@components/dev-env/dev-app'), { ssr: false });

const DevPanel: React.FC<Props> = ({ panelKey, panelMeta }) => {
  const [failed, setFailed] = useState(false);
  const initialized = useSelector(({ layout: { panel } }) =>
    !!(panel[panelKey]?.initialized));
  const devMeta = useSelector(({ devEnv: { panelToMeta } }) =>
    panelKey in panelToMeta ? panelToMeta[panelKey] : null);

  /**
   * When panel initialized we create DevPanelMeta in devEnv.panelToMeta.
   * We then drive the panel's rendering using the latter meta.
   * This permits us to change the contents of the panel.
   */
  const dispatch = useDispatch();
  useEffect(() => {
    if (initialized) {
      if (panelMeta && isFilePanel(panelMeta)) {
        dispatch(Act.createFilePanelMeta({ filename: panelMeta.filename, panelKey }));
      } else if (panelMeta && isAppPanel(panelMeta)) {
        dispatch(Act.createAppPanelMeta({ panelKey }));
      } else if (panelMeta && isDocPanel(panelMeta)) {
        dispatch(Act.createDocPanelMeta({ panelKey, filename: panelMeta.filename }));
      } else {
        setFailed(true);
      }
    }
    return () => initialized && dispatch(Act.forgetPanelMeta({ panelKey }));
  }, [initialized]);

  return devMeta ? (
    <>
      <div style={{ height: 8, background: '#222', borderBottom: '1px solid #112' }} />
      {devMeta.panelType === 'file' &&
        <DevEditor panelKey={panelKey} filename={devMeta.filename} />}
      {devMeta.panelType === 'doc' &&
        <DevDoc panelKey={panelKey} filename={devMeta.filename} />}
      {devMeta.panelType === 'app' &&
        <DevApp panelKey={panelKey} />}
      {failed && (
        <div className={css.unsupportedPanel}>
          {`Unsupported panel '${panelKey}' with meta '${JSON.stringify(panelMeta)}'`}
        </div>
      )}
    </>
  ) : null;
};

interface Props {
  panelKey: string;
  panelMeta?: LayoutPanelMeta<CustomPanelMetaKey>;
}

export default DevPanel;
