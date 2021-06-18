import styled from "@emotion/styled";
import { useState } from "react";

export const Section = styled.section<{}>`
  border-radius: 0 0 12px 12px;
  border: 1px solid #ddd;
  padding: 0 16px 16px 24px;
  margin-bottom: 24px;
  font-size: 20px;

  @media(max-width: 800px) {
    padding: 0 12px 4px 4px;
    border: 0;
  }
`;

export function TwoPanel({
  children,
  height,
}: TwoPanelProps) {
  const [mode, setMode] = useState(2 as TwoPanelMode);
  return (
    <TwoPanelRoot mode={mode}>
      <TwoPanelMenu setMode={setMode} />
      <TwoPanels height={height} mode={mode}> 
        {children}
      </TwoPanels>
    </TwoPanelRoot>
  );
}

type TwoPanelProps = React.PropsWithChildren<{ height: number }>;
/** (100, 0), (50, 50) or (0, 100) */
type TwoPanelMode = 1 | 2 | 3;

function TwoPanelMenu({ setMode }: {
  setMode: (mode: TwoPanelMode) => void;
}) {
  return (
    <section className="menu">
      <div onClick={() => setMode(1)}>1</div>
      <div onClick={() => setMode(2)}>2</div>
      <div onClick={() => setMode(3)}>3</div>
    </section>
  );
}

const TwoPanelRoot = styled.section<{ mode: TwoPanelMode }>`
  position: relative;
  .menu {
    position: absolute;
    z-index: 1;
    top: -26px;
    right: 0;
    color: white;
    display: flex;
    user-select: none;

    div {
      background: #333;
      padding: 4px 8px;
      margin-left: 2px;
      cursor: pointer;
    }

    div:nth-of-type(${({ mode }) => mode}) {
      background: #a00;
    }
  }
`;

const TwoPanels = styled.section<{
  height: number;
  mode: TwoPanelMode;
}>`
  display: grid;
  grid-template-columns: ${({ mode }) =>
    mode === 2 && '50% 50%' ||
    mode === 1 && '100% 0%' ||
    '0% 100%'};
  grid-template-rows: 100%;
  height: ${({ height }) => height}px;

  @media(max-width: 1000px) {
    grid-template-columns: 100%;
    grid-template-rows: ${({ mode }) =>
      mode === 2 && '50% 50%' ||
      mode === 1 && '100% 0%' ||
      '0% 100%'};
    height: ${({ mode, height }) =>
      (mode === 2 ? 2 : 1) * height}px;
  }
`;
