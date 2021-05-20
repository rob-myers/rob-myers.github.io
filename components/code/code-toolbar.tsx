import { useCallback, useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import useCode, { CodeMeta } from "store/code.store";
import { CodeError } from "model/code/code.service";

export default function CodeToolbar({ code, error }: Props) {
  const [showError, setShowError] = useState(false);

  const toggleShowError = useCallback(() => {
    error && setShowError(x => !x);
  }, [showError, error]);

  const reset = useCallback(() => {
    if (code) {
      useCode.api.updateCode(code.key, ({ original }) => ({ current: original }));
      useCode.api.persist(code.key);
    }
  }, [code]);

  const toggleLazy = useCallback(() => {
    if (code) {
      useCode.api.updateCode(code.key, ({ lazy }) => ({ lazy: !lazy }));
      useCode.api.persist(code.key);
    }
  }, [code]);

  return (
    <>
      <Root>
        <div>{code?.key}</div>
        <RightToolbar>
          <ErrorButton
            greyed={!error}
            onClick={toggleShowError}
          >
            error
          </ErrorButton>
          <LazyloadButton
            greyed={code?.lazy??true}
            title="lazy load?"
            onClick={toggleLazy}
          >
            lazy
          </LazyloadButton>
          <ResetButton onClick={reset}>
            reset
          </ResetButton>
        </RightToolbar>
      </Root>
      {error && showError && <ErrorPanel>
        ⚠️&nbsp; Line {error.line}: {error.error}
      </ErrorPanel>}
    </>
  );
}

interface Props {
  code: CodeMeta | null;
  error?: CodeError;
}

const Root = styled.section`
  font-size: 10pt;
  background: #222;
  color: #fff;
  height: 28px;
  padding: 0 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
`;

const RightToolbar = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
  gap: 12px;
`;

const ErrorButton = styled.div<{ greyed: boolean }>`
  outline: none;
  cursor: pointer;
  color: #f44;
  ${({ greyed }) => greyed && css`color: #777;`}
`;

const LazyloadButton = styled.div<{ greyed: boolean }>`
  outline: none;
  cursor: pointer;
  color: #ddd;
  ${({ greyed }) => greyed && css`color: #777;`}
`;

const ResetButton = styled.div<{}>`
  outline: none;
  cursor: pointer;
  color: #ddd;
`;

const ErrorPanel = styled.div<{}>`
  position: absolute;
  right: 0;
  top: 27px;
  font-size: 9pt;
  padding: 4px 8px;
  background: #522;
  color: #fff;
  border: 1px solid #333;
  z-index: 10;
`;
