import { useState, useRef } from "react";

/**
 * @template T
 * @param {T} useRefArg 
 * @returns {[() => void, T]}
 */
export default function useForceRefresh(useRefArg) {
  const [, setState] = useState(0);
  return [
    useRef(() => setState(x => ++x)).current,
    useRef(useRefArg).current,
  ];
}
