import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Thunk, Act } from '@store/dev-env.duck';
import Select from '@components/select/select';
import css from './dev-panel-opener.scss';

const DevPanelOpener: React.FC = () => {
  const [targetRect, setTargetRect] = useState<null | DOMRect>(null);
  const [xOffset, setXOffset] = useState(0);

  const panelOpener = useSelector(({ devEnv }) => devEnv.panelOpener);
  const filenames = useSelector(({ devEnv }) => Object.keys(devEnv.file));
  const selectedKey = useSelector(({ devEnv }) => {
    if (panelOpener?.panelKey) {
      const meta = devEnv.panelToMeta[panelOpener.panelKey];
      return meta.panelType === 'app'  ? 'app' : meta.filename;
    }
    return null;
  });

  const dispatch = useDispatch();
  const close = () => {
    setXOffset(0);
    dispatch(Act.closePanelOpener());
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

  useEffect(() => {
    const nextTarget = panelOpener && document.getElementById(panelOpener.elementId) || null;
    setTargetRect(nextTarget ? nextTarget.getBoundingClientRect() : null);
  }, [panelOpener]);
  
  useEffect(() => {
    const onResize = () => close();
    window.addEventListener('resize', onResize);
    return () => void window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className={css.root}>
      {panelOpener?.panelKey && targetRect && (
        <section
          className={css.panel}
          style={{
            left: targetRect.left - xOffset,
            top: targetRect.bottom + 2,
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
            setXOffset(Math.max(0, targetRect.left + rect.width - window.innerWidth));
          }}
        />
        </section>
      )}
    </div>
  );
};

export default DevPanelOpener;