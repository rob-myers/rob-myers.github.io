import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import classNames from 'classnames';
import css from './select.scss';

const Select: React.FC<Props> = ({
  alignedRight = false,
  disabled = false,
  items,
  onChange,
  overrideLabel,
  selectedKey,
  showSelectedOption = true,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const selected = items.find(({ itemKey }) => itemKey === selectedKey) || items[0];
  const toggle = () => !disabled && setIsOpen(!isOpen);

  // Force initial focus e.g. for dropdown
  useEffect(() => rootRef.current!.focus(), []);
  useEffect(() => void disabled && setIsOpen(false), [disabled]);

  return items.length ? (
    <div
      ref={rootRef}
      className={classNames(css.root, { [css.open]: isOpen })}
      tabIndex={0}
      onBlur={() => setIsOpen(false)}
      onKeyUp={({ key }) => (key === 'Escape') && setIsOpen(false)}
    >
      <div className={css.selected} onClick={toggle}>
        <Option
          {...selected}
          label={overrideLabel || selected.label}
          icon={overrideLabel ? undefined : selected.icon}
        />
      </div>
      <div className={css.optionsAnchor}>
        {isOpen && (
          <div
            ref={innerRef}
            className={classNames(css.options, {
              [css.alignedRight]: alignedRight
            })}
          >
            {items
              .filter(item => showSelectedOption || item.itemKey !== selectedKey)
              .map(item => (
                <Option
                  key={item.itemKey}
                  {...item}
                  onClick={() => {
                    if (!disabled && selectedKey !== item.itemKey) {
                      onChange(item.itemKey);
                      setIsOpen(false);
                    }
                  }}
                  highlight={item.itemKey === selectedKey}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  ) : null;
};

interface Props {
  alignedRight?: boolean;
  disabled?: boolean;
  items: Item[];
  onChange: (key: string) => void;
  /** Can override main label */
  overrideLabel?: string;
  selectedKey: string | null;
  showSelectedOption?: boolean;
}

const Option: React.FC<OptionProps> = ({
  label,
  highlight,
  icon,
  onClick,
}) => {
  return (
    <div
      className={classNames(css.option, {
        [css.highlighted]: highlight,
      })}
      onClick={onClick}
    >
      {label}
      {icon && <div className={css.icon}>{icon}</div>}
    </div>
  );
};

interface OptionProps extends Item {
  onClick?: () => void;  
  highlight?: boolean;
}

interface Item {
  itemKey: string;
  label: string;
  icon?: string;
}

export default Select;
