/** https://www.30secondsofcode.org/react/s/tabs */
import React, { useCallback, useState, useMemo } from "react";
import styled from "@emotion/styled";

export function Tabs({
  defaultIndex = 0,
  onTabClick,
  children,
}: React.PropsWithChildren<{
  children: React.ReactElement[];
  defaultIndex?: number;
  onTabClick?: (newIndex: number) => void;
}>) {
  const [bindIndex, setBindIndex] = useState(defaultIndex);
  const changeTab = useCallback((newIndex: number) => {
    onTabClick?.(newIndex);
    setBindIndex(newIndex);
  }, []);
  const items = useMemo(() => React.Children.toArray(children)
    .filter((x): x is React.ReactElement<TabItemProps> => React.isValidElement(x) && x.type === TabItem)
  , [children]);

  return (
    <Wrapper className="wrapper">
      <div className="tab-menu">
        {items.map(({ props: { index, label } }) => (
          <button
            key={`tab-btn-${index}`}
            onClick={() => changeTab(index)}
            className={bindIndex === index ? 'focus' : ''}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="tab-view">
        {items.map(({ props }) => (
          <div
            {...props}
            className={`tab-content ${
              bindIndex === props.index ? 'selected' : ''
            }`}
            key={`tab-content-${props.index}`}
          />
        ))}
      </div>
    </Wrapper>
  );
};

export function TabItem(props: React.PropsWithChildren<TabItemProps>) {
  return <div {...props} />;
}

interface TabItemProps {
  index: number;
  label: string;
}

const Wrapper = styled.div`
  .tab-menu > button {
    cursor: pointer;
    padding: 8px 16px;
    border: 0;
    border-bottom: 2px solid transparent;
    background: none;
  }

  .tab-menu > button.focus {
    border-bottom: 2px solid #007bef;
  }

  .tab-menu > button:hover {
    border-bottom: 2px solid #007bef;
  }

  .tab-content {
    display: none;
  }

  .tab-content.selected {
    display: block;
  }
`;
