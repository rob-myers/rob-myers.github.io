import { useCallback } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { StageMeta } from "model/stage/stage.model";
import useStage from "store/stage.store";

const StageToolbar: React.FC<Props> = ({ stage }) => {

  const toggleRunning = useCallback(() => {
    if (stage) {
      // TODO
    }
  },[stage]);

  const toggleCam = useCallback(() => stage &&
    useStage.api.updateOpts(stage.key, ({ panZoom }) =>
      ({ panZoom: !panZoom })
    ),[stage]);

  return (
    <Toolbar>
      {stage && <>
        <LeftToolbar>
          <span>@<strong>{stage.key}</strong></span>
          <Button enabled onClick={toggleRunning}>
            running
          </Button>
        </LeftToolbar>
        <Button enabled={stage.opts.panZoom} onClick={toggleCam}>
          panzoom
        </Button>
      </>}
    </Toolbar>
  );
};

interface Props {
  stage: StageMeta | null;
}

const Toolbar = styled.section`
  display: grid;
  grid-template-columns: auto 70px;
  gap: 8px;

  height: 28px;
  user-select: none;
  font-size: 16px;
  border-bottom: 1px solid #ddd;
  padding: 4px;
  background-color: white;
`;

const LeftToolbar = styled.section`
  display: grid;
  grid-template-columns: 42px auto;
  gap: 8px;
`;

const Button = styled.span<{ enabled: boolean }>`
  cursor: pointer;
  ${({ enabled }) => css`
    color: ${enabled ? '#000' : '#999'};
  `}
`;

export default StageToolbar;