import styled from "@emotion/styled";
import { css } from "@emotion/react";

const Placeholder: React.FC<Props> = ({  dataUrl, everUsed, enableStage }) => {
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
  dataUrl?: string;
  everUsed: boolean;
  enableStage: () => void;
}

const Root = styled.div<{}>`
  background: #666;
  width: 100%;
  overflow: hidden;
  display: flex;
  height: inherit;
  position: relative;
`;

const PlaceholderImage = styled.img<{ fade: boolean }>`
  @keyframes darken {
    0% { filter: brightness(100%); }
    100% { filter: brightness(70%); }
  }
  ${({ fade }) => fade
    && css`animation: darken 0.4s ease-out forwards 1;`
    || css`filter: brightness(70%);`
  }

  background: #fff;
  margin: auto;
  max-width: 100%;
  max-height: 100%;
`;

const PlaceholderMessage = styled.div<{}>`
  position: absolute;
  width: inherit;
  top: calc(50% - 2.8rem);
  display: flex;
  justify-content: center;
  font-size: 3rem;
  font-weight: lighter;
  font-family: 'Courier New', Courier, monospace;
  color: white;
  > div {
    cursor: pointer;
  }
`;

export default Placeholder;
