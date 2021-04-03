import { useCallback } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { StageMeta } from "model/stage/stage.model";
import useStage from "store/stage.store";

const StageToolbar: React.FC<Props> = ({ stage }) => {

  const toggleCam = useCallback(() => stage &&
    useStage.api.updateOpts(stage.key, ({ panZoom }) =>
      ({ panZoom: !panZoom })
    ),[stage]);

  return (
    <Toolbar>
      {stage && <>
        <section>
          @<strong>{stage.key}</strong>
        </section>
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
  user-select: none;
  height: 28px;
  font-size: 16px;
  border-bottom: 1px solid #ddd;
  display: grid;
  padding: 4px;
  grid-template-columns: auto 70px;
  gap: 8px;
  background-color: white;
`;

const Button = styled.span<{ enabled: boolean }>`
  cursor: pointer;
  ${({ enabled }) => css`
    color: ${enabled ? '#000' : '#999'};
  `}
`;

export default StageToolbar;