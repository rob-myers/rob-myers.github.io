import React from "react";

/**
 * Returns changed return value of callback.
 * For example, () => Date.now() will change on resize.
 * @template T
 * @param {() => T} cb
 */
export default function useOnResize(cb) {
    const [state, setState] = React.useState(() => cb());

    React.useEffect(() => {
        function onResize() { setState(cb()); }
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    
    return state;
}
