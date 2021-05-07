import React, { useCallback, useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { StageOpts, StageSelection } from "model/stage/stage.model";
import useStage from "store/stage.store";

const StageToolbar: React.FC<Props> = ({ stageKey, opt, selection }) => {
  const [canToggleRunning, setCanToggleRunning] = useState(true);
  const enableUi = opt.enabled && canToggleRunning;

  const toggleRunning = useCallback(() => {
    if (canToggleRunning) {
      useStage.api.updateOpt(stageKey, { enabled: !opt.enabled });
      setCanToggleRunning(false);
      setTimeout(() => setCanToggleRunning(true), 1000);
    }
  }, [opt.enabled, canToggleRunning]);

  const onSelectAction = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    switch (e.currentTarget.value) {
      case 'toggle-select':
        enableUi && useStage.api.updateSel(stageKey, ({ enabled }) => ({ enabled: !enabled }));
        break;
      case 'toggle-lock-cursor':
        enableUi && useStage.api.updateOpt(stageKey, ({ lockCursor }) => ({ lockCursor: !lockCursor }));
        break;
      case 'unlock-copy':
        enableUi && useStage.api.updateSel(stageKey, ({ locked }) => ({ locked: !locked }));
        break;
    }
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
          <SelectAction
            disabled={!enableUi}
            value="disabled"
            onChange={onSelectAction}
          >
            <option disabled value="disabled">
              act
            </option>
            <option value="toggle-select">
              {selection.enabled ? 'hide select' : 'allow select'}
            </option>
            <option value="toggle-lock-cursor">
              {opt.lockCursor ? 'unlock cursor' : 'lock cursor'}
            </option>
            {selection.enabled && selection.locked &&
              <option value="unlock-copy">
                unlock copy
              </option>
            }
          </SelectAction>
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
  font-size: 10pt;

  height: 28px;
  min-height: 28px;
  padding: 0 8px;

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
  grid-template-columns: 40px 60px 54px;
  gap: 0px;
`;

const StageKey = styled.div``;

const PauseButton = styled.div<{ emphasis?: boolean; }>`
  cursor: pointer;
  outline: none;
  color: #dfd;
  font-style: ${({ emphasis = false }) => emphasis ? 'italic' : ''};
`;

const SelectAction = styled.select<{}>`
  background: inherit;
  color: #fff;
  outline: 0;
  padding-left: 1px;
  width: 45px;
  margin-top: 1px;
  font-family: 'Courier New', Courier, monospace;
`;

const RightToolbar = styled.section`
  display: grid;
  grid-template-columns: auto 70px;
  gap: 6px;
`;

const PanZoomButton = styled.div<{ greyed?: boolean; emphasis?: boolean; }>`
  cursor: pointer;
  outline: none;
  ${({ greyed = false }) => css`
    color: ${greyed ? '#777' : '#ddd'};
  `}
`;

export default StageToolbar;