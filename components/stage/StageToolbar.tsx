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

  const onSelectTrigger = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    switch (e.currentTarget.value) {
      // TODO
    }
  }, [enableUi]);
  
  const toggleUnlockCopy = useCallback(() => enableUi && selection.locked &&
    useStage.api.updateSel(stageKey, ({ locked }) => ({ locked: !locked }))
  , [enableUi, selection]);

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
          <SelectTrigger
            disabled={!enableUi}
            value="disabled"
            onChange={onSelectTrigger}
          >
            <option disabled value="disabled">
              trigger
            </option>
            <option value="red">red</option>
            <option value="blue">blue</option>
            <option value="green">green</option>
          </SelectTrigger>
        </Slot>
      </LeftToolbar>
      <RightToolbar>
        <Slot>
            <UnlockCopyButton
              onClick={toggleUnlockCopy}
              title="click to unlock copy"
              enabled={enableUi && selection.enabled && selection.locked}
            >
              copying
            </UnlockCopyButton>
        </Slot>
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