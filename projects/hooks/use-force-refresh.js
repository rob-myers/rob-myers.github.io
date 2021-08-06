import { useState, useMemo, useCallback } from "react";

/**
 * @template T
 * @param {undefined | (() => T)} useMemoArg 
 * @returns {[() => void, T]}
 */
export default function useForceRefresh(
  useMemoArg = () => /** @type {any} */ (undefined)
) {
  const [, setState] = useState(0);
  return [
    useCallback(() => setState(x => ++x), []),
    useMemo(useMemoArg, []),
  ];
}
