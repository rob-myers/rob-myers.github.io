import React, { useCallback, useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { StageOpts } from "model/stage/stage.model";
import useStage from "store/stage.store";

const StageToolbar: React.FC<Props> = ({ stageKey, opt }) => {
  const [canToggleRunning, setCanToggleRunning] = useState(true);
  const enableUi = opt.enabled && canToggleRunning;

  const toggleRunning = useCallback(() => {
    if (canToggleRunning) {
      useStage.api.updateOpt(stageKey, { enabled: !opt.enabled });
      setCanToggleRunning(false);
      setTimeout(() => setCanToggleRunning(true), 1000);
    }
  }, [opt.enabled, canToggleRunning]);

  const toggleCam = useCallback(() => enableUi &&
    useStage.api.updateOpt(stageKey, ({ panZoom }) => ({ panZoom: !panZoom }))
  , [enableUi]);

  const togglePersist = useCallback(() => {
    useStage.api.updateOpt(stageKey, ({ persist }) => ({ persist: !persist }));
    useStage.api.persist(stageKey, true); // Force a persist
  }, [enableUi]);

  return (
    <Toolbar>
      <LeftToolbar>
        <Slot>
          <StageKey>
            @{stageKey}
          </StageKey>
        </Slot>
        <Slot>
          <PauseButton
            onClick={toggleRunning}
            pending={!canToggleRunning}
            title="toggle enabled"
          >
            {opt.enabled ? 'running' : 'paused'}
          </PauseButton>
        </Slot>
        <Slot>
        </Slot>
      </LeftToolbar>
      <RightToolbar>
        <Slot>
          <PanZoomButton
            greyed={!(enableUi && opt.panZoom)}
            title="scroll/pinch to panzoom?"
            {...enableUi && { onClick: toggleCam }}
          >
            capture
          </PanZoomButton>
        </Slot>
        <Slot>
          <PersistButton
              greyed={!opt.persist}
              title="save data?"
              onClick={togglePersist}
            >
              persist
            </PersistButton>
        </Slot>
      </RightToolbar>
    </Toolbar>
  );
};

interface Props {
  stageKey: string;
  opt: StageOpts;
}

const Toolbar = styled.section`
  display: flex;
  justify-content: space-between;
  user-select: none;
  font-size: 10pt;

  height: 28px;
  min-height: 28px;
  padding: 0 12px 0 8px;

  background-color: #333;
  color: #ddd;
`;

const Slot = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LeftToolbar = styled.section`
  display: grid;
  grid-template-columns: auto auto auto;
  gap: 10px;
`;

const StageKey = styled.div``;

const PauseButton = styled.div<{ pending: boolean; }>`
  cursor: pointer;
  outline: none;
  color: #dfd;
  ${({ pending }) => pending && css`
    font-style: italic;
    color: #ddd;
  `}
`;

const RightToolbar = styled.section`
  display: grid;
  grid-template-columns: auto auto;
  gap: 10px;
`;


const PersistButton = styled.div<{ greyed: boolean }>`
  outline: none;
  cursor: pointer;
  ${({ greyed = false }) => greyed
    && css`color: #777;`
    || css`color: #ddd;`}
`;

const PanZoomButton = styled.div<{ greyed: boolean }>`
  outline: none;
  ${({ greyed = false }) => greyed
    && css`color: #777; cursor: auto;`
    || css`color: #ddd; cursor: pointer;`}
`;

export default StageToolbar;