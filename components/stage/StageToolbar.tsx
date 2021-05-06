import { useCallback, useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { StageOpts, StageSelection } from "model/stage/stage.model";
import useStage from "store/stage.store";

const StageToolbar: React.FC<Props> = ({ stageKey, opt, selection }) => {
  const [canToggleRunning, setCanToggleRunning] = useState(true);

  const toggleRunning = useCallback(() => {
    if (canToggleRunning) {
      useStage.api.updateOpt(stageKey, { enabled: !opt.enabled });
      setCanToggleRunning(false);
      setTimeout(() => setCanToggleRunning(true), 1000);
    }
  }, [opt.enabled, canToggleRunning]);

  const enableUi = opt.enabled && canToggleRunning;
  const enableSelUi = enableUi && selection.enabled;

  const toggleSelectionEnabled = useCallback((_e: React.MouseEvent<HTMLDivElement>) => {
    enableUi && useStage.api.updateSel(stageKey, ({ enabled }) => ({ enabled: !enabled }));
  }, [enableUi]);

  const toggleCursorLocked = useCallback((_) => {
    enableUi && useStage.api.updateOpt(stageKey, ({ lockCursor }) => ({ lockCursor: !lockCursor }));
  }, [enableUi]);

  const toggleCam = useCallback(() => {
    enableUi && useStage.api.updateOpt(stageKey, ({ panZoom }) => ({ panZoom: !panZoom }));
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
            emphasis={!canToggleRunning}
          >
            {opt.enabled ? 'running' : 'paused'}
          </PauseButton>
        </Slot>
        <Slot>
          <SelectButton
            greyed={!enableSelUi}
            onClick={toggleSelectionEnabled}
            title="toggle selection mode"
          >
            select
          </SelectButton>
        </Slot>
        <Slot>
          <LockedIcon
            visible={enableUi && opt.lockCursor}
            onClick={toggleCursorLocked}
            title={enableSelUi ? "toggle cursor lock" : ""}
          >
            🔒
          </LockedIcon>
        </Slot>
      </LeftToolbar>
      <RightToolbar>
        <Slot />
        <Slot>
          <PanZoomButton
            greyed={!(enableUi && opt.panZoom)}
            {...enableUi && {
              onClick: toggleCam,
              ...opt.panZoom && { title: 'click to disable' },
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
  selection: StageSelection;
}

const Toolbar = styled.section`
  display: flex;
  justify-content: space-between;
  user-select: none;

  height: 28px;
  min-height: 28px;
  font-size: 16px;
  padding: 0 4px 0px 8px;

  background-color: #333;
  border-radius: 2px 2px 0 0;
  color: #ddd;
`;

const Slot = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LeftToolbar = styled.section`
  display: grid;
  grid-template-columns: auto 45px auto 8px;
  gap: 8px;
  font-size: 10pt;
`;

const StageKey = styled.div``;

const PauseButton = styled.div<{ emphasis?: boolean; }>`
  cursor: pointer;
  outline: none;
  color: #dfd;
  font-style: ${({ emphasis = false }) => emphasis ? 'italic' : ''};
`;

const SelectButton = styled.div<{ greyed?: boolean }>`
  cursor: pointer;
  display: flex;
  color: ${({ greyed }) => greyed ? '#aaa' : '#fff'};
`;

const LockedIcon = styled.div<{ visible?: boolean }>`
  cursor: pointer;
  opacity: ${({ visible }) => visible ? 1 : 0.4};
`;

const RightToolbar = styled.section`
  display: grid;
  grid-template-columns: auto 70px;
  gap: 6px;
  font-size: 10pt;
`;

const PanZoomButton = styled.div<{ greyed?: boolean; emphasis?: boolean; }>`
  cursor: pointer;
  outline: none;
  ${({ greyed = false }) => css`
    color: ${greyed ? '#777' : '#ddd'};
  `}
`;

export default StageToolbar;