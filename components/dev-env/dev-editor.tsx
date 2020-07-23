import classNames from 'classnames';
import { hasSupportedExtension, panelKeyToEditorKey } from '@model/dev-env/dev-env.model';
import { filenameToModelKey } from '@model/monaco/monaco.model';
import Editor from '@components/monaco/editor';

/**
 * We use this scss to augment syntax highlighting of tsx in monaco editor.
 * Can't use css modules because we don't know the prefix in webworker.
 * Use `require` to avoid tree-shaking in production.
 */
require('./monaco-override.scss');
import css from './dev-editor.scss';

const DevEditor: React.FC<Props> = ({ filename, panelKey }) => {
  return (
    <div className={css.editor}>
      {hasSupportedExtension(filename) && (
        <Editor
          editorKey={panelKeyToEditorKey(panelKey)}
          filename={filename}
          modelKey={filenameToModelKey(filename)}
          width="100%"
          height="100%"
          className={classNames({
            'monaco-tsx-editor': filename.endsWith('.tsx'),
          })}
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
