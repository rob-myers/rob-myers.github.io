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
            emphasis={!canToggleRunning}
          >
            {opt.enabled ? 'running' : 'paused'}
          </PauseButton>
        </Slot>
        <Slot>
        </Slot>
      </LeftToolbar>
      <RightToolbar>
        <Slot>
        </Slot>
        <Slot>
          <PanZoomButton
            greyed={!(enableUi && opt.panZoom)}
            title="scroll/pinch to panzoom?"
            {...enableUi && {
              onClick: toggleCam,
            }}
          >
            panzoom
          </PanZoomButton>
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
  grid-template-columns: 40px 64px 64px;
  gap: 0px;
`;

const StageKey = styled.div``;

const PauseButton = styled.div<{ emphasis?: boolean; }>`
  cursor: pointer;
  outline: none;
  color: #dfd;
  font-style: ${({ emphasis = false }) => emphasis ? 'italic' : ''};
`;

const SelectTrigger = styled.select<{}>`
  background: inherit;
  color: #fff;
  outline: 0;
  padding-left: 1px;
  margin-top: 1px;
`;

const RightToolbar = styled.section`
  display: grid;
  grid-template-columns: auto auto;
  gap: 12px;
`;

const UnlockCopyButton = styled.div<{ enabled: boolean; }>`
  cursor: pointer;
  color: ${({ enabled }) => enabled ? 'white' : '#777'};
`;

const PanZoomButton = styled.div<{ greyed?: boolean; emphasis?: boolean; }>`
  cursor: pointer;
  outline: none;
  ${({ greyed = false }) => css`
    color: ${greyed ? '#777' : '#ddd'};
  `}
`;

export default StageToolbar;