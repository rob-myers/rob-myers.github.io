import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { LayoutPanelMeta } from '@model/layout/layout.model';
import { CustomPanelMetaKey } from '@model/layout/example-layout.model';
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
  } else if (panelKey.startsWith('app')) {
    return <div style={{ padding: 8, color: 'white' }}>
      App ({panelKey})
    </div>;
  }

  return (
    <div style={{ color: 'red', padding: '8px 0 0 8px' }}>{
      `Unsupported panel "${panelKey}" with meta "${JSON.stringify(panelMeta)}"`
    }</div>
  );  
};

interface Props {
  panelKey: string;
  panelMeta?: LayoutPanelMeta<CustomPanelMetaKey>;
}

export default WindowPanel;


const supportedFileMetas = [
  { filenameExt: '.tsx', panelKeyPrefix: 'tsx' },
  { filenameExt: '.scss', panelKeyPrefix: 'scss'},
  { filenameExt: '.ts', panelKeyPrefix: 'ts'},
];

function isFilePanel(panelKey: string, filename?: string) {
  return supportedFileMetas.some(({ filenameExt, panelKeyPrefix }) =>
    panelKey.startsWith(panelKeyPrefix) && filename?.endsWith(filenameExt));
}
