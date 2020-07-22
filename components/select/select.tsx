import { useState, useEffect } from 'react';
import classNames from 'classnames';
import css from './select.scss';

const Option: React.FC<OptionProps> = ({ label, onClick }) => {
  return (
    <div
      className={css.option}
      onClick={onClick}
    >
      {label}
    </div>
  );
};

interface OptionProps extends Item {
  onClick: () => void;  
}

const Select: React.FC<Props> = ({
  disabled = false,
  items,
  onChange,
  selectedKey,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = items.find(({ itemKey }) => itemKey === selectedKey) || items[0];

  useEffect(() => {
    disabled && setIsOpen(false);
  }, [disabled]);

  return items.length ? (
    <div className={classNames(css.root, {
      [css.open]: isOpen,
    })}>
      <div
        className={css.selected}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <Option {...selected} onClick={() => null} />
      </div>
      <div className={css.optionsAnchor}>
        {isOpen && (
          <div className={css.options}>
            {items.map(item => (
              <Option
                key={item.itemKey}
                {...item}
                onClick={() => {
                  if (!disabled && selectedKey !== item.itemKey) {
                    onChange(item.itemKey);
                    setIsOpen(false);
                  }
                }}
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
}

interface Item {
  itemKey: string;
  label: string;
}

export default Select;
