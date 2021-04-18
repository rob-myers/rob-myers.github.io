import { useCallback, useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { StageOpts, StageSelection } from "model/stage/stage.model";
import useStage from "store/stage.store";

const StageToolbar: React.FC<Props> = ({ stageKey, opts, selection }) => {
  const [canToggleRunning, setCanToggleRunning] = useState(true);

  const toggleRunning = useCallback(() => {
    if (canToggleRunning) {
      useStage.api.updateOpts(stageKey, { enabled: !opts.enabled });
      setCanToggleRunning(false);
      setTimeout(() => setCanToggleRunning(true), 1000);
    }
  }, [opts.enabled, canToggleRunning]);

  const enableUi = opts.enabled && canToggleRunning;
  
  const changeSelector = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    enableUi && useStage.api.updateSelection(stageKey, { selector: e.currentTarget.value as any });
  }, [enableUi]);

  const toggleSelectorLocked = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    enableUi && useStage.api.updateSelection(stageKey, ({ locked }) => ({ locked: !locked }));
  }, [enableUi]);

  const toggleCam = useCallback(() => {
    enableUi && useStage.api.updateOpts(stageKey, { panZoom: !opts.panZoom });
  }, [enableUi, opts.panZoom]);

  return (
    <Toolbar>
        <LeftToolbar>
          <Slot>
            @<strong>{stageKey}</strong>
          </Slot>
          <Slot background="#eee">
            <Button
              onClick={toggleRunning}
              {...opts.enabled && { title: 'click to pause' }}
              emphasis={!canToggleRunning}
              style={{ color: opts.enabled ?  '#030' : '#300' }}
            >
              {opts.enabled ? 'running' : 'paused'}
            </Button>
          </Slot>
          <Slot>
            <SelectMode
              disabled={!enableUi}
              value={selection.selector}
              onChange={changeSelector}
            >
              <option key="disabled" value="disabled" disabled>
                selector
              </option>
              <option key="crosshair" value="crosshair">crosshair</option>
              <option key="rectangle" value="rectangle">rectangle</option>
              <option key="rectilinear" value="rectilinear">rectilinear</option>
            </SelectMode>
            <LockedButton
              greyed={!(enableUi && selection.locked)}
              onClick={toggleSelectorLocked}
            >
              locked
            </LockedButton>
          </Slot>
        </LeftToolbar>

        <RightToolbar>
          <Slot />
          <Slot>
            <Button
              greyed={!(enableUi && opts.panZoom)}
              {...enableUi && {
                onClick: toggleCam,
                ...opts.panZoom && { title: 'click to disable' },
              }}
            >
              panzoom
            </Button>
          </Slot>
        </RightToolbar>
    </Toolbar>
  );
};

interface Props {
  stageKey: string;
  opts: StageOpts;
  selection: StageSelection;
}

const Slot = styled.div<{ background?: string }>`
  display: flex;
  justify-content: center;
  ${({ background }) => css`
    background: ${background};
  `}
`;

const Toolbar = styled.section`
  display: flex;
  justify-content: space-between;
  user-select: none;

  height: 28px;
  font-size: 16px;
  border-bottom: 1px solid #ddd;
  padding: 4px 8px;
  background-color: white;
`;

const LeftToolbar = styled.section`
  display: grid;
  grid-template-columns: 42px 60px auto;
  gap: 8px;
`;

const SelectMode = styled.select`
  display: flex;
  width: fit-content;
  border-radius: 3px 0 0 3px;
  border-color: #999;
  outline: none;
`;

const LockedButton = styled.div<{ greyed?: boolean }>`
  cursor: pointer;
  display: flex;
  justify-content: center;
  font-size: small;
  padding: 0 4px 0 5px;
  border-radius: 1px 3px 3px 1px;
  border: 1px solid #000;
  border-left-width: 0;
  color: ${({ greyed }) => greyed ? '#aaa' : '#000'};
  border-color: #999;
`;

const RightToolbar = styled.section`
  display: grid;
  grid-template-columns: auto 66px;
  gap: 6px;
`;

const Button = styled.div<{ greyed?: boolean; emphasis?: boolean; }>`
  cursor: pointer;
  font-size: 11pt;

  ${({ greyed = false }) => css`
    color: ${greyed ? '#999' : '#000'};
  `}
  ${({ emphasis = false }) => emphasis && css`
    font-style: italic;
  `}
`;

export default StageToolbar;