import { useSelector } from 'react-redux';
import { LayoutPanelMeta } from '@model/layout/layout.model';
import { CustomPanelMetaKey } from '@model/layout/example-layout.model';
import css from './window-panel.scss';

const Error: React.FC<{ message: string }> = ({ message }) => (
  <div className={css.errorMessage}>{message}</div>
);

const extensions = ['tsx', 'scss', 'ts'];

const WindowPanel: React.FC<Props> = ({ panelKey, panelMeta }) => {
  if (!useSelector(({ layout: { panel } }) => panel[panelKey]?.initialized)) {
    return null;
  }

  const [panelType] = panelKey.split('-');
  const filename = panelMeta?.filename || null;
  
  if (extensions.includes(panelType)) {
    return filename
      ? <div>File: {panelKey} {filename}</div>
      : <Error message={`File panel "${panelKey}" needs panelMeta.filename`} />;
  }
  
  if (panelType === 'app') {
    return (
      <div style={{ padding: 8, color: 'white' }}>App</div>
    );
  }

  return <Error
    message={`Panel "${panelKey}" has unknown type "${panelType}"`}
  />;
};

interface Props {
  panelKey: string;
  panelMeta?: LayoutPanelMeta<CustomPanelMetaKey>;
}

export default WindowPanel;
