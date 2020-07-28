import { useState, useEffect } from 'react';
import classNames from 'classnames';
import css from './select.scss';

const Select: React.FC<Props> = ({
  disabled = false,
  items,
  onChange,
  overrideLabel,
  selectedKey,
  showSelectedOption = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = items.find(({ itemKey }) => itemKey === selectedKey) || items[0];
  const toggle = () => !disabled && setIsOpen(!isOpen);

  useEffect(() => void disabled && setIsOpen(false), [disabled]);

  return items.length ? (
    <div
      className={classNames(css.root, {
        [css.open]: isOpen,
      })}
      tabIndex={0}
      onBlur={() => setIsOpen(false)}
      onKeyUp={({ key }) => key === 'Escape' && setIsOpen(false)}
    >
      <div className={css.selected} onClick={toggle}>
        <Option {...selected} label={overrideLabel || selected.label} icon={overrideLabel ? undefined : selected.icon} />
      </div>
      <div className={css.optionsAnchor}>
        {isOpen && (
          <div className={css.options}>
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
  disabled?: boolean;
  items: Item[];
  onChange: (key: string) => void;
  /** Can override label */
  overrideLabel?: string;
  selectedKey: string;
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
      {icon && <div>{icon}</div>}
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
