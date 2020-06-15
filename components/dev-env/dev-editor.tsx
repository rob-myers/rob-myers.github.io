import classNames from 'classnames';
import { hasSupportedExtension } from './dev-env.model';
import Editor from '@components/monaco/editor';

// Used to fix TSX syntax highlighting of monaco editor.
// We mustn't use CSS modules -- see styles.config.ts.
// Must `require` to avoid tree-shaking in production.
require('./monaco-override.scss');
import css from './dev-editor.scss';

const DevEditor: React.FC<Props> = ({ filename, panelKey }) => {
  return (
    <div className={css.editor}>
      {hasSupportedExtension(filename) && (
        <Editor
          editorKey={`editor-${panelKey}`}
          filename={filename}
          modelKey={`model-${filename}`}
          width="100%"
          height="100%"
          className={classNames({ 'monaco-tsx-editor': filename.endsWith('.tsx') })}
        />
      )}
    </div>
  );
};

interface Props {
  filename: string;
  panelKey: string;
}

export default DevEditor;
