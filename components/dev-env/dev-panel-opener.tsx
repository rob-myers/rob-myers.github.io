import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';

import { Thunk, Act } from '@store/dev-env.duck';
import css from './dev-panel-opener.scss';

const DevPanelOpener: React.FC = () => {
  const itemsRef = useRef<HTMLDivElement>(null);
  const [targetRect, setTargetRect] = useState<null | DOMRect>(null);
  const [xOffset, setXOffset] = useState(0);

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

  const items = [
    { itemKey: 'app', label: 'App' },
    ...filenames.map(filename => ({ itemKey: filename, label: filename })),
  ];

  const dispatch = useDispatch();

  const handleFileChange = (panelKey: string, value: string) => {
    if (value === 'app') {
      dispatch(Thunk.changePanel({ panelKey, next: { to: 'app' } }));
    } else if (value.startsWith('docs/')) {
      dispatch(Thunk.changePanel({ panelKey, next: { to: 'doc', filename: value } }));
    } else {
      dispatch(Thunk.changePanel({ panelKey, next: { to: 'file', filename: value } }));
    }
  };

  useEffect(() => {
    if (panelOpener) {
      const nextTarget = document.getElementById(panelOpener.elementId);
      setTargetRect(nextTarget?.getBoundingClientRect() || null);
      const rect = itemsRef.current?.getBoundingClientRect();
      rect && setXOffset(57 - rect.width);
    } else {
      setXOffset(0);
    }
  }, [panelOpener, resizedAt]);

  return (
    <div
      className={css.root}
      style={!panelOpener ? { display: 'none' } : undefined}
      onDoubleClick={() => dispatch(Act.closePanelOpener())}
    >
      <section
        className={css.panel}
        style={
          targetRect ? {
            left: targetRect.left + xOffset - 3,
            top: targetRect.bottom + 3,
          } : undefined
        }
      >
      <div ref={itemsRef}>
        {items.map(item => (
          <Item
            key={item.itemKey}
            itemKey={item.itemKey}
            label={item.label}
            highlight={item.itemKey === selectedKey}
            onClick={() => {
              if (panelOpener && selectedKey !== item.itemKey) {
                handleFileChange(panelOpener.panelKey, item.itemKey);
              }
            }}
          />
        ))}
      </div>
      </section>
    </div>
  );
};

const Item: React.FC<ItemProps> = ({
  label,
  highlight,
  onClick,
}) => {
  return (
    <div
      className={classNames(css.item, {
        [css.highlighted]: highlight,
      })}
      onClick={onClick}
    >
      {label}
    </div>
  );
};

interface ItemProps {
  itemKey: string;
  label: string;
  onClick?: () => void;  
  highlight?: boolean;
}


export default DevPanelOpener;