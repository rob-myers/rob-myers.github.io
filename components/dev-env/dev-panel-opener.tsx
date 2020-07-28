import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Thunk } from '@store/dev-env.duck';
import Select from '@components/select/select';
import css from './dev-panel-opener.scss';

const DevPanelOpener: React.FC = () => {
  const [targetRect, setTargetRect] = useState<null | DOMRect>(null);
  const [xOffset, setXOffset] = useState(0);
  const [closed, setClosed] = useState(true);

  const panelOpener = useSelector(({ devEnv }) => devEnv.panelOpener);
  const filenames = useSelector(({ devEnv }) => Object.keys(devEnv.file));
  const selectedKey = useSelector(({ devEnv }) => {
    if (panelOpener?.panelKey && panelOpener.panelKey in devEnv.panelToMeta) {
      const meta = devEnv.panelToMeta[panelOpener.panelKey];
      return meta.panelType === 'app'  ? 'app' : meta.filename;
    }
    return null;
  });
  const resizedAt = useSelector(({ layout }) =>
    panelOpener && layout.panel[panelOpener.panelKey]?.resizedAt);

  const dispatch = useDispatch();
  const close = () => {
    setXOffset(0);
    setClosed(true);
  }
  const handleFileChange = (panelKey: string, value: string) => {
    if (value === 'app') {
      dispatch(Thunk.changePanel({ panelKey, next: { to: 'app' } }));
    } else if (value.startsWith('docs/')) {
      dispatch(Thunk.changePanel({ panelKey, next: { to: 'doc', filename: value } }));
    } else {
      dispatch(Thunk.changePanel({ panelKey, next: { to: 'file', filename: value } }));
    }
    close();
  };
  const updateTargetRect = () => {
    const nextTarget = panelOpener && document.getElementById(panelOpener.elementId) || null;
    setTargetRect(nextTarget ? nextTarget.getBoundingClientRect() : null);
  };

  useEffect(() => {
    updateTargetRect();
    panelOpener && setClosed(false);
  }, [panelOpener]);

  useEffect(() => {
    panelOpener && !closed && updateTargetRect();
  }, [resizedAt]);

  return (
    <div className={css.root}>
      {!closed && panelOpener?.panelKey && targetRect && (
        <section
          className={css.panel}
          style={{
            left: targetRect.left + xOffset,
            top: targetRect.bottom + 3,
          }}
        >
        <Select
          items={[
            { itemKey: 'app', label: 'App' },
            ...filenames.map(filename => ({ itemKey: filename, label: filename })),
          ]}
          onChange={(itemKey) => handleFileChange(panelOpener.panelKey, itemKey)}
          selectedKey={selectedKey}
          dropdown
          onBlur={close}
          provideItemsBounds={(rect) => {
            setXOffset(57 - rect.width);
          }}
        />
        </section>
      )}
    </div>
  );
};

export default DevPanelOpener;