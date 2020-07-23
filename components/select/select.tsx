import { useState, useEffect } from 'react';
import classNames from 'classnames';
import css from './select.scss';

const Select: React.FC<Props> = ({
  disabled = false,
  items,
  onChange,
  selectedKey,
  showSelectedOption = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = items.find(({ itemKey }) => itemKey === selectedKey) || items[0];
  const toggle = () => !disabled && setIsOpen(!isOpen);

  useEffect(() => {
    disabled && setIsOpen(false);
  }, [disabled]);

  return items.length ? (
    <div
      className={classNames(css.root, { [css.open]: isOpen })}
      tabIndex={0}
      onBlur={() => setIsOpen(false)}
      onKeyUp={({ key }) => key === 'Escape' && setIsOpen(false)}
    >
      <div className={css.selected}>
        <Option {...selected} onClick={toggle} />
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
  selectedKey: string;
  showSelectedOption?: boolean;
}

const Option: React.FC<OptionProps> = ({ label, onClick, highlight }) => {
  return (
    <div
      className={classNames(css.option, {
        [css.highlighted]: highlight,
      })}
      onClick={onClick}
    >
      {label}
    </div>
  );
};

interface OptionProps extends Item {
  onClick: () => void;  
  highlight?: boolean;
}

interface Item {
  itemKey: string;
  label: string;
}

export default Select;
