import React from "react";
import useUpdate from "./use-update";

/**
 * Returns changed return value of callback.
 * For example, () => Date.now() will change on resize.
 * @template T
 * @param {() => T} cb
 */
export default function useOnResize(cb) {
    // Always provide same object so can pass around without getting stale
    const [state] = React.useState(() => ({ value: cb() }));
    const update = useUpdate();

    React.useEffect(() => {
        function onResize() {
            state.value = cb();
            update();
        }
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    
    return state;
}
