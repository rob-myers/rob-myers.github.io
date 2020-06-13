import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { LayoutPanelMeta } from '@model/layout/layout.model';
import { CustomPanelMetaKey } from '@model/layout/example-layout.model';
import DevApp from './dev-app';
const DevEditor = dynamic(import('@components/dev-env/dev-editor'), { ssr: false });

const WindowPanel: React.FC<Props> = ({ panelKey, panelMeta }) => {
  if (!useSelector(({ layout: { panel } }) => panel[panelKey]?.initialized)) {
    return null;
  }
  
  if (isFilePanel(panelKey, panelMeta?.filename)) {
    return (
      <DevEditor
        filename={panelMeta!.filename!}
        panelKey={panelKey}
      />
    );
  } else if (/^app(-|$)/.test(panelKey)) {
    return (
      <DevApp
        panelKey={panelKey}
      />
    );
  }

  return (
    <div style={{ color: 'red', background: 'white', padding: 8 }}>{
      `Unsupported panel "${panelKey}" with meta "${JSON.stringify(panelMeta)}"`
    }</div>
  );  
};

interface Props {
  panelKey: string;
  panelMeta?: LayoutPanelMeta<CustomPanelMetaKey>;
}

const supportedFileMetas = [
  { filenameExt: '.tsx', panelKeyPrefix: 'tsx' },
  { filenameExt: '.scss', panelKeyPrefix: 'scss'},
  { filenameExt: '.ts', panelKeyPrefix: 'ts'},
];

function isFilePanel(panelKey: string, filename?: string) {
  return supportedFileMetas.some(({ filenameExt, panelKeyPrefix }) =>
    panelKey.startsWith(panelKeyPrefix) && filename?.endsWith(filenameExt));
}

export default WindowPanel;
