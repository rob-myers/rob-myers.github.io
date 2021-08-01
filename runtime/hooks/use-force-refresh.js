import { useState, useRef, useMemo } from "react";

/**
 * @template T
 * @param {() => T} useMemoArg 
 * @returns {[() => void, T]}
 */
export default function useForceRefresh(useMemoArg) {
  const [, setState] = useState(0);
  return [
    useRef(() => setState(x => ++x)).current,
    useMemo(useMemoArg, []),
  ];
}
