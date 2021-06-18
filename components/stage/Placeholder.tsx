import { useCallback } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import useStage from "store/stage.store";

export default function Placeholder({ viewKey, everUsed, dataUrl }: Props) {
  const enableStage = useCallback(() =>
    useStage.api.updateOpt(viewKey, { enabled: true })
  , [viewKey]);

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
  viewKey: string;
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
  color: white;
  top: calc(50% - 2rem);
  width: 100%;
  display: flex;
  justify-content: center;

  font-weight: lighter;
  font-size: 2rem;
  letter-spacing: 8px;
  user-select: none;

  > div {
    cursor: pointer;
  }
`;
