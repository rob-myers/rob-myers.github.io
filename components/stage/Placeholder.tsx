import { useCallback } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import useStage from "store/stage.store";

const Placeholder: React.FC<Props> = ({ stageKey, dataUrl, everUsed }) => {
  const enableStage = useCallback(() =>
    useStage.api.updateOpt(stageKey, { enabled: true })
  , [stageKey]);

  return (
    <Root>
      <PlaceholderImage
        src={dataUrl}
        draggable={false}
        fade={everUsed}
      />
      <PlaceholderMessage>
        <div onClick={enableStage}>
          Click to enable
        </div>
      </PlaceholderMessage>
    </Root>
  );
};

interface Props {
  stageKey: string;
  dataUrl?: string;
  everUsed: boolean;
}

const Root = styled.div<{}>`
  background: #666;
  width: 100%;
  height: inherit;
  overflow: hidden;
  display: flex;
  position: relative;
`;

const PlaceholderImage = styled.img<{ fade: boolean }>`
  @keyframes darken {
    0% { filter: brightness(100%); }
    100% { filter: brightness(60%); }
  }
  ${({ fade }) => fade
    && css`animation: darken 0.4s ease-out forwards 1;`
    || css`filter: brightness(60%);`
  }

  background: #fff;
  margin: auto;
  max-width: 100%;
  max-height: 100%;
  user-select: none;
`;

const PlaceholderMessage = styled.div<{}>`
  position: absolute;
  width: inherit;
  top: calc(50% - 3.5rem);
  display: flex;
  justify-content: center;
  user-select: none;

  font-size: 3.8rem;
  font-weight: lighter;
  letter-spacing: 8px;
  color: white;

  > div {
    cursor: pointer;
  }

  @media(max-width: 800px) {
    font-size: 2.5rem;
  }
`;

export default Placeholder;
